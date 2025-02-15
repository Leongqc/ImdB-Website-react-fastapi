# backend/main.py

from fastapi import FastAPI, HTTPException, Query, Depends
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field
from typing import List, Optional
from fastapi.middleware.cors import CORSMiddleware
from passlib.context import CryptContext  # For hashing passwords
from datetime import datetime, timedelta
from jose import JWTError, jwt
from fastapi.security import OAuth2PasswordBearer

app = FastAPI()

# CORS configuration to allow frontend to access backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React app domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
client = AsyncIOMotorClient("mongodb://localhost:27017")
db = client["IWD"]
movies_collection = db["IMDb"]
user = db["user"]

# Secret key and algorithm for JWT
SECRET_KEY = "IWD"  # Make sure to use a strong key!
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30  # Token expiration time
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# User model for request validation
class UserRegister(BaseModel):
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str
    
# Pydantic model for user change passowrd
class ChangePassword(BaseModel):
    oldPassword: str
    newPassword: str
    
# Define a model for a single component (preference)
class Component(BaseModel):
    id: str
    label: str
    isVisible: bool

# Define the model for the entire user preferences
class UserPreferences(BaseModel):
    components: List[Component]
    
# Define a model for filter preference    
class FilterPreferences(BaseModel):
    genres: str  
    year: str
    
# Define a model for favourite movie preference    
class FavouriteMovie(BaseModel):
    movie_id: int
    
class searchHistory(BaseModel):
    category: str
    searchTerm: str
    selectedGenre: str
    ratingRange: str
    yearRange: str
    
class userSearchHistory(BaseModel):
    history: List[searchHistory]

# Helper function to hash passwords
def hash_password(password: str):
    return pwd_context.hash(password)
    
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


# Function to create a JWT token
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

class ProductionCountryResponse(BaseModel):
    name: str
    movieCount: int
    
class PopVsRatingData(BaseModel):
    year: int
    avgRating: float
    avgPopularity: float
    count: int
    
class ProductionData(BaseModel):
    country: str
    count: int
    totalRevenue: float
    
class ActorFrequencyData(BaseModel):
    actor: str
    frequency: int
    
# Pydantic Models
class Movie(BaseModel):
    id: int
    title: str
    vote_average: float
    vote_count: int
    status: Optional[str]
    release_date: Optional[str]
    revenue: Optional[int]
    runtime: Optional[int]
    adult: Optional[bool]
    budget: Optional[int]
    imdb_id: Optional[str]
    original_language: Optional[str]
    original_title: Optional[str]
    overview: Optional[str]
    popularity: Optional[float]
    tagline: Optional[str]
    production_companies: Optional[str]
    production_countries: Optional[List[str]]
    spoken_languages: Optional[List[str]]
    keywords: Optional[List[str]]
    release_year: Optional[int]
    Director: Optional[str]
    AverageRating: Optional[float]
    Poster_Link: Optional[str]
    Certificate: Optional[str]
    IMDB_Rating: Optional[float]
    Meta_score: Optional[float]
    Star1: Optional[str]
    Star2: Optional[str]
    Star3: Optional[str]
    Star4: Optional[str]
    Writer: Optional[str]
    Director_of_Photography: Optional[str]
    Producers: Optional[str]
    Music_Composer: Optional[str]
    genres_list: Optional[List[str]]
    Cast_list: Optional[List[str]]
    overview_sentiment: Optional[float]
    all_combined_keywords: Optional[List[str]]

    class Config:
        orm_mode = True

# Movie related API Endpoints

@app.get("/movies", response_model=List[Movie])
async def get_movies(
    genre: Optional[str] = Query(None, description="Filter by genre"),
    title: Optional[str] = Query(None, description="Filter by title"),
    year: Optional[int] = Query(None, description="Filter by release year"),
    director: Optional[str] = Query(None, description="Filter by director"),
    sort_by: Optional[str] = Query("vote_average", description="Sort by field"),
    limit: int = Query(1000, description="Limit number of results"),
    page: int = Query(1, description="Page number")
):
    query = {}
    if genre:
        query["genres_list"] = {"$regex": genre, "$options": "i"} # Case-insensitive regex search
    if title:
        query["title"] = {"$regex": title, "$options": "i"}  # Case-insensitive regex search
    if year:
        query["release_year"] = year
    if director:
        query["Director"] = {"$regex": director, "$options": "i"}  # Case-insensitive regex search

    skip = (page - 1) * limit  # Pagination logic
    cursor = movies_collection.find(query).sort(sort_by, -1).skip(skip).limit(limit)
    
    movies = []
    async for document in cursor:
        movies.append(Movie(**document))
    
    return movies
    
@app.get("/movie/search")
async def search_movies(
    category: Optional[str] = Query(None),
    searchTerm: Optional[str] = Query(None),
    genres: Optional[List[str]] = Query(None),
    ratingRange: Optional[str] = Query(None),
    yearRange: Optional[str] = Query(None)
):
    query = {}

    # Handle category-based search
    if category and searchTerm:
        if category == "title":
            query['title'] = {'$regex': searchTerm, '$options': 'i'}  # Case insensitive
        elif category == "director":
            query['Director'] = {'$regex': searchTerm, '$options': 'i'}
        elif category == "year":
            query['release_year'] = int(searchTerm)

    # Handle genres filter
    if genres:
        query['genres_list'] = {'$in': genres}  # Match any of the selected genres

    # Handle rating range filter
    if ratingRange:
        min_rating, max_rating = map(float, ratingRange.split(','))
        query['AverageRating'] = {'$gte': min_rating, '$lte': max_rating}

    # Handle year range filter
    if yearRange:
        min_year, max_year = map(int, yearRange.split(','))
        query['release_year'] = {'$gte': min_year, '$lte': max_year}

    # Fetch results from MongoDB using async cursor
    movies = []
    async for document in movies_collection.find(query):
        movies.append(document)  # Append the document directly

    # Optionally, exclude the MongoDB internal `_id` field
    for movie in movies:
        movie['_id'] = str(movie['_id'])

    return movies

@app.get("/movies/top-rated", response_model=List[Movie])
async def get_top_rated_movies(limit: int = 10, filter: str = "highest-rated"):
    
    if filter == "highest-rated":
        pipeline = [
            {
                "$match": {"AverageRating": {"$ne": None}}  # Exclude documents without an average rating
            },
            {
                "$sort": {"AverageRating": -1}  # Sort by AverageRating in descending order
            },
            {
            "$limit": limit  # Limit the number of results
            }
        ]
        
    elif filter == "popularity":
        pipeline = [
            {
                "$match": {"popularity": {"$ne": None}}  # Exclude documents without an average rating
            },
            {
                "$sort": {"popularity": -1}  # Sort by AverageRating in descending order
            },
            {
            "$limit": limit  # Limit the number of results
            }
        ]
        
    else :
        pipeline = [
            {
                "$match": {"genres_list": filter}  # Match documents where genres_list contains the genre
            },
            {
                "$sort": {"AverageRating": -1}  # Sort by AverageRating in descending order
            },
            {
                "$limit": limit  # Limit the number of results
            }
        ]
    
    top_movies = await movies_collection.aggregate(pipeline).to_list(length=None)  # Use aggregate with the pipeline

    # Convert the raw documents to Movie instances
    return [Movie(**movie) for movie in top_movies]
    
    
@app.get("/movies/pop-vs-rating", response_model=List[PopVsRatingData])
async def get_pop_vs_rating(filter: str = "highest-rated"):
        # Set the pipeline based on the filter type
    if filter == "highest-rated":
        pipeline = [
            # Match movies with non-null ratings and popularity
            {"$match": {"AverageRating": {"$ne": None}, "popularity": {"$ne": None}}},

            # Group by release_year, calculating the average rating and popularity per year
            {
                "$group": {
                    "_id": "$release_year",  # Directly use release_year field
                    "avgRating": {"$avg": "$AverageRating"},
                    "avgPopularity": {"$avg": "$popularity"},
                    "count": {"$sum": 1}  # Optional: Keeping the count if needed
                }
            },
            # Sort by release_year in ascending order
            {"$sort": {"_id": 1}}
        ]
    
    else:
        pipeline = [
            # Match movies that include the specified genre and have non-null ratings and popularity
            {"$match": {"genres_list": filter, "AverageRating": {"$ne": None}, "popularity": {"$ne": None}}},
            
            # Group by release_year, calculating the average rating and popularity per year for the genre
            {
                "$group": {
                    "_id": "$release_year",  # Directly use release_year field
                    "avgRating": {"$avg": "$AverageRating"},
                    "avgPopularity": {"$avg": "$popularity"},
                    "count": {"$sum": 1}  # Optional: Keeping the count if needed
                }
            },
            # Sort by release_year in ascending order
            {"$sort": {"_id": 1}}
        ]
    
    # Run the pipeline and get the result
    result = await movies_collection.aggregate(pipeline).to_list(length=None)

    # Format the result to match the PopVsRatingData model with two decimal places
    formatted_result = [
        PopVsRatingData(
            year=item["_id"], 
            avgRating=round(item["avgRating"], 2), 
            avgPopularity=round(item["avgPopularity"], 2),
            count=item["count"]
        )
        for item in result if item["_id"] is not None
    ]

    return formatted_result
    
@app.get("/movies/production", response_model=List[ProductionData])
async def get_production(filter: str = "highest-rated"):
    # Define the pipeline based on filter type
    pipeline = []

    # Default (highest-rated) filter: aggregate by production country
    if filter == "highest-rated":
        pipeline = [
            # Unwind production_countries to handle multiple countries per movie
            {"$unwind": "$production_countries"},
            
            # Match only records with non-null production countries and revenue data
            {"$match": {"production_countries": {"$nin": [None, "N/A"]}, "revenue": {"$ne": None}}},

            # Group by country, summing up movie count and revenue per country
            {
                "$group": {
                    "_id": "$production_countries",
                    "movie_count": {"$sum": 1},
                    "total_revenue": {"$sum": "$revenue"}
                }
            },

            # Sort by movie count in descending order and limit to top 5 countries
            {"$sort": {"movie_count": -1}},
            {"$limit": 5}
        ]
    
    else:
        # Genre filter: match specified genre and then aggregate by production country
        pipeline = [
            {"$match": {"genres_list": filter, "production_countries": {"$nin": [None, "N/A"]}, "revenue": {"$ne": None}}},
            {"$unwind": "$production_countries"},
            {
                "$group": {
                    "_id": "$production_countries",
                    "movie_count": {"$sum": 1},
                    "total_revenue": {"$sum": "$revenue"}
                }
            },
            {"$sort": {"movie_count": -1}},
            {"$limit": 5}
        ]
    
    # Execute the pipeline
    result = await movies_collection.aggregate(pipeline).to_list(length=None)

    # Format the result to match the ProductionData model, ensuring two decimal precision on revenue
    formatted_result = [
        ProductionData(
            country=item["_id"],
            count=item["movie_count"],
            totalRevenue=round(item["total_revenue"], 2)
        )
        for item in result if item["_id"] is not None
    ]

    return formatted_result

@app.get("/movies/top-actors", response_model=List[ActorFrequencyData])
async def get_top_actors(filter: str = "highest-rated"):
    # Define the pipeline based on filter type
    pipeline = []

    # Default (highest-rated) filter: aggregate actors from the cast_list
    if filter == "highest-rated":
        pipeline = [
            # Unwind cast_list to handle multiple actors per movie
            {"$unwind": "$Cast_list"},
            
            # Match only records with non-null or valid actors
            {"$match": {"Cast_list": {"$nin": [None, "Unknown"]}}},

            # Group by actor, summing up the count of appearances
            {
                "$group": {
                    "_id": "$Cast_list",
                    "actor_count": {"$sum": 1}
                }
            },

            # Sort by actor count in descending order and limit to top 5 actors
            {"$sort": {"actor_count": -1}},
            {"$limit": 5}
        ]
    
    else:
        # Genre filter: match specified genre and then aggregate by actors from cast_list
        pipeline = [
            {"$match": {"genres_list": filter, "Cast_list": {"$nin": [None, "Unknown"]}}},
            {"$unwind": "$Cast_list"},
            {
                "$group": {
                    "_id": "$Cast_list",
                    "actor_count": {"$sum": 1}
                }
            },
            {"$sort": {"actor_count": -1}},
            {"$limit": 5}
        ]
    
    # Execute the pipeline
    result = await movies_collection.aggregate(pipeline).to_list(length=None)

    # Format the result to match the ActorFrequencyData model
    formatted_result = [
        ActorFrequencyData(
            actor=item["_id"],
            frequency=item["actor_count"]
        )
        for item in result if item["_id"] is not None
    ]

    return formatted_result



@app.get("/movies/most-popular", response_model=List[Movie])
async def get_popular_movies(limit: int = 10):
    pipeline = [
        {
            "$match": {"AverageRating": {"$ne": None}}  # Exclude documents without an average rating
        },
        {
            "$sort": {"popularity": -1}  # Sort by popularity in descending order
        },
        {
            "$limit": limit  # Limit the number of results
        }
    ]
    
    popular_movies = await movies_collection.aggregate(pipeline).to_list(length=None)  # Use aggregate with the pipeline

    # Convert the raw documents to Movie instances
    return [Movie(**movie) for movie in popular_movies]
    
    
@app.get("/movies/unique-languages", response_model=int)
async def get_unique_languages():
    pipeline = [
        {
                "$match": {
                    "spoken_languages": {"$ne": "N/A"}  # Exclude documents with spoken_languages = "N/A"
                }
        },
        {
            "$unwind": "$spoken_languages"  # Unwind the array to get individual languages
        },
        {
            "$group": {
                "_id": "$spoken_languages",  # Group by language
            }
        },
        {
            "$count": "unique_language_count"  # Count the unique languages
        }
    ]

    result = await movies_collection.aggregate(pipeline).to_list(length=None)

    # Return the count of unique languages or 0 if none are found
    return result[0]['unique_language_count'] if result else 0
    
@app.get("/movies/production-country", response_model=List[ProductionCountryResponse])
async def get_production_country_counts():
    try:
        pipeline = [
            {
                "$match": {
                    "production_countries": {"$ne": "N/A"}  # Exclude documents with production_countries = "N/A"
                }
            },
            {
                "$unwind": "$production_countries"  # Deconstruct the production_countries array
            },
            {
                "$group": {
                    "_id": "$production_countries",  # Group by production country
                    "movieCount": {"$sum": 1}  # Count the number of movies
                }
            },
            {
                "$project": {
                    "name": "$_id",  # Rename _id to name
                    "movieCount": 1,
                    "_id": 0  # Exclude the _id field
                }
            }
        ]

        results = await movies_collection.aggregate(pipeline).to_list(length=None)  # Execute the aggregation
        return results

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



@app.get("/movies/genre-breakdown")
async def get_genre_breakdown():
    pipeline = [
        {
            "$match": {
                "genres_list": {"$ne": "Unknown"}  # Exclude documents with genres_list = "Unknown"
            }
        },
        {"$unwind": "$genres_list"},
        {"$group": {"_id": "$genres_list", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}
    ]
    results = await movies_collection.aggregate(pipeline).to_list(length=None)
    return results

@app.get("/movies/releases-over-time")
async def get_releases_over_time():
    pipeline = [
        {
            "$group": {
                "_id": "$release_year",
                "revenue": {"$sum": "$revenue"},  # Summing up the revenue field
                "count": {"$sum": 1}  # Optional: Keeping the count if needed
            }
        },
        {"$sort": {"_id": 1}}  # Sorting by year
    ]
    results = await movies_collection.aggregate(pipeline).to_list(length=None)
    return results

@app.get("/movies/{movie_id}", response_model=Movie)
async def get_movie(movie_id: int):
    movie = await movies_collection.find_one({"id": movie_id})
    if movie:
        return Movie(**movie)
    raise HTTPException(status_code=404, detail="Movie not found")
    
@app.get("/movies/actors/frequency")
async def actor_frequency():
    pipeline = [
        {
                "$match": {
                    "Cast_list": {"$ne": "Unknown"}  # Exclude documents with production_countries = "N/A"
                }
        },
        {"$unwind": "$Cast_list"},  # Unwind the cast list to get individual actors
        {"$unwind": "$genres_list"},  # Unwind the genres list to get individual genres
        {
            "$group": {
                "_id": {"actor": "$Cast_list", "genre": "$genres_list"},  # Group by both actor and genre
                "count": {"$sum": 1}  # Count the occurrences
            }
        },
        {"$sort": {"count": -1}},  # Sort by count
        {"$limit": 50}  # Limit to top 50 combinations of actor-genre
    ]
    frequency = await movies_collection.aggregate(pipeline).to_list(None)
    #print(f"Document Retrieved: {frequency}")  # Debugging output
    return frequency


@app.get("/movies/ratings/distribution")
async def ratings_distribution():
    pipeline = [
        # Match documents that have a valid AverageRating and non-empty genres_list
        {"$match": {"AverageRating": {"$ne": None}, "genres_list": {"$ne": []}}},

        # Unwind the genres_list so we can group by individual genres
        {"$unwind": "$genres_list"},
        
        # Group by genre and calculate the highest rating and count of movies in each genre
        {
            "$group": {
                "_id": "$genres_list",  # Group by genre
                "highest_rating": {"$max": "$AverageRating"},  # Get the highest average rating
                "count": {"$sum": 1}  # Count of movies in each genre
            }
        },
        
        # Sort by genre name (alphabetically)
        {"$sort": {"_id": 1}}  
    ]

    # Execute the aggregation pipeline
    distribution = await movies_collection.aggregate(pipeline).to_list(length=None)

    return distribution

# User Related API Endpoint

@app.post("/movie/register")
async def register(register_request: UserRegister):
    RegisterEmail = register_request.email
    RegisterPassword = register_request.password
    
    # Check if the user already exists
    existing_user = await user.find_one({"Email": RegisterEmail})
    
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Hash the password before storing it
    hashed_password = hash_password(RegisterPassword)
    
    # Insert the user data into the database
    new_user = {
        "Email": RegisterEmail,
        "Password": hashed_password,  # Store the hashed password, not plain text
        "preferences": [
            {"id": "1", "label": "Your Favourite Movie", "isVisible": True},
            #{"id": "2", "label": "KPI Cards", "isVisible": True},
            #{"id": "3", "label": "Genre Breakdown Chart", "isVisible": True},
            #{"id": "4", "label": "Actor Frequency Chart", "isVisible": True},
            #{"id": "5", "label": "Release Over Time Chart", "isVisible": True},
            #{"id": "6", "label": "Rating Distribution Chart", "isVisible": True},
            #{"id": "7", "label": "Search Bar", "isVisible": True},
            #{"id": "8", "label": "Filter Movie", "isVisible": True},
            #{"id": "9", "label": "Top 10 Highest-Rated Movies", "isVisible": True},
            #{"id": "10", "label": "Movies by Production Country", "isVisible": True},
            {"id": "11", "label": "Movie Suggestion", "isVisible": True},
            {"id": "12", "label": "Multiple Chart", "isVisible": True}
        ],
        "filter": {
            "genres": "",
            "year": ""
        },
        "favouriteMovie": 0,
        "searchHistory": [
            {"category": "", "searchTerm": "", "selectedGenre": "", "ratingRange": "", "yearRange":""},
            {"category": "", "searchTerm": "", "selectedGenre": "", "ratingRange": "", "yearRange":""},
            {"category": "", "searchTerm": "", "selectedGenre": "", "ratingRange": "", "yearRange":""},
            {"category": "", "searchTerm": "", "selectedGenre": "", "ratingRange": "", "yearRange":""},
            {"category": "", "searchTerm": "", "selectedGenre": "", "ratingRange": "", "yearRange":""}
        ],
        "searchedMovie": []
    }
    
    await user.insert_one(new_user)
    
    return {"message": "Registration successful. You can now log in."}

@app.post("/movie/login")
async def login(user_login: UserLogin):  # Rename the input variable to avoid conflict
    LoginEmail = user_login.email
    LoginPassword = user_login.password

    # Fetch the user from the database
    db_user = await user.find_one({"Email": LoginEmail})  # 'user' is the MongoDB collection, keep it

    if not db_user:
        raise HTTPException(status_code=400, detail="Invalid email or password")

    # Verify the password directly
    if not verify_password(LoginPassword, db_user["Password"]):  # Compare plain password with hashed password
        raise HTTPException(status_code=400, detail="Invalid email or password")
    
    # Create JWT token
    access_token = create_access_token(data={"sub": user_login.email})
    return {"access_token": access_token, "token_type": "bearer"}


#User Change password
@app.post("/movie/change-password")
async def change_password(change_password: ChangePassword, token: str = Depends(oauth2_scheme)):
    try:
        # Decode the JWT token to get the user's email
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Could not validate credentials")
    except JWTError:
        raise HTTPException(status_code=401, detail="Could not validate credentials")
    
    #print(email)
    # Fetch the user from the database using the email
    db_user = await user.find_one({"Email": email})
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Verify the old password
    if not verify_password(change_password.oldPassword, db_user["Password"]):
        raise HTTPException(status_code=400, detail="Old password is incorrect")
    
    # Hash the new password
    new_hashed_password = hash_password(change_password.newPassword)
    
    # Update the password in the database
    await user.update_one({"Email": email}, {"$set": {"Password": new_hashed_password}})
    
    return {"msg": "Password updated successfully"}
    
#User Update Preference
@app.post("/movie/update-user-preference")
async def update_preference(preferences: UserPreferences, token: str = Depends(oauth2_scheme)):
    try:
        # Decode the JWT token to get the user's email
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Could not validate credentials")
    except JWTError:
        raise HTTPException(status_code=401, detail="Could not validate credentials")

    # Fetch the user from the database using the email
    db_user = await user.find_one({"Email": email})
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Update the user's preferences in the database
    update_result = await user.update_one(
        {"Email": email},  # Find user by email
        {"$set": {"preferences": preferences.dict()["components"]}}  # Update preferences
    )

    # Check if the update was successful
    if update_result.modified_count == 0:
        raise HTTPException(status_code=400, detail="Failed to update preferences")

    return {"message": "Preferences updated successfully"}

#Get preference    
@app.get("/movie/user-preferences", response_model=UserPreferences)
async def get_preference(token: str = Depends(oauth2_scheme)):
    try:
        # Decode the JWT token to get the user's email
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Could not validate credentials")
    except JWTError:
        raise HTTPException(status_code=401, detail="Could not validate credentials")

    # Fetch the user from the database using the email
    db_user = await user.find_one({"Email": email})
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    # Retrieve components from the user preferences
    components_data = db_user.get("preferences", [])
    
    if not components_data:
        raise HTTPException(status_code=404, detail="No preferences found")

    # Convert the raw data from the database to a list of `Component` objects
    components = [Component(**component) for component in components_data]

    # Return the structured user preferences
    return UserPreferences(components=components)
    
#Save Filter
@app.post("/movie/save-filter")
async def save_filter(preferences: FilterPreferences, token: str = Depends(oauth2_scheme)):
    try:
        # Decode the JWT token to get the user's email
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Could not validate credentials")
    except JWTError:
        raise HTTPException(status_code=401, detail="Could not validate credentials")

    # Fetch the user from the database using the email
    db_user = await user.find_one({"Email": email})
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # Update the user's filter in the database
    update_result = await user.update_one(
        {"Email": email},  # Find user by email
        {"$set": {"filter": {"genres": preferences.genres, "year": preferences.year}}}  # Update preferences
    )

    if update_result.modified_count == 0:
        raise HTTPException(status_code=400, detail="Filter preferences not updated")

    return {"detail": "Filter preferences updated successfully"}
    
#Get saved Filter
@app.get("/movie/getfilter", response_model=FilterPreferences)
async def get_filter(token: str = Depends(oauth2_scheme)):
    try:
        # Decode the JWT token to get the user's email
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Could not validate credentials")
    except JWTError:
        raise HTTPException(status_code=401, detail="Could not validate credentials")

    # Fetch the user from the database using the email
    db_user = await user.find_one({"Email": email})
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # Retrieve filter from the user preferences
    filter_data = db_user.get("filter", {})
    
    if not filter_data:
        raise HTTPException(status_code=404, detail="No preferences found")
        
    # Make sure the returned data matches the FilterPreferences model
    return FilterPreferences(**filter_data)

#Get search history
@app.get("/movie/history-data", response_model=List[searchHistory])
async def get_history(token: str = Depends(oauth2_scheme)):
    try:
        # Decode the JWT token to get the user's email
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Could not validate credentials")
    except JWTError:
        raise HTTPException(status_code=401, detail="Could not validate credentials")

    # Fetch the user from the database using the email
    db_user = await user.find_one({"Email": email})
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    # Fetch the search history
    searchData = db_user.get("searchHistory", [])
    
    if not searchData:
        raise HTTPException(status_code=404, detail="No History found")

    # Ensure the searchData is a list of searchHistory objects
    return [searchHistory(**item) for item in searchData]
 
#Update append search history 
@app.post("/movie/historyupdate")
async def update_history(history: userSearchHistory, token: str = Depends(oauth2_scheme)):
    try:
        # Decode the JWT token to get the user's email
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Could not validate credentials")
    except JWTError:
        raise HTTPException(status_code=401, detail="Could not validate credentials")

    # Fetch the user from the database using the email
    db_user = await user.find_one({"Email": email})
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    # Update search history and limit to 5 entries
    new_search_history = db_user.get("searchHistory", [])
    
     # Prepend the new history to the front of the list
    new_search_history.insert(0, {
        "category": history.history[-1].category, 
        "searchTerm": history.history[-1].searchTerm,
        "selectedGenre": history.history[-1].selectedGenre,
        "ratingRange": history.history[-1].ratingRange,
        "yearRange": history.history[-1].yearRange
    })

    # Keep only the last 5 entries in search history
    if len(new_search_history) > 5:
        new_search_history = new_search_history[:5]  # Keep only the first 5 entries

    # Update the user document with the new search history
    await user.update_one({"Email": email}, {"$set": {"searchHistory": new_search_history}})

    return {"msg": "Search history updated"}
    
@app.post("/movie/save-fav-movie")
async def update_favorite_movie(movie: FavouriteMovie, token: str = Depends(oauth2_scheme)):
    try:
        # Decode the JWT token to get the user's email
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Could not validate credentials")
    except JWTError:
        raise HTTPException(status_code=401, detail="Could not validate credentials")

    # Fetch the user from the database using the email
    db_user = await user.find_one({"Email": email})
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # Update the movie ID in the database
    await user.update_one({"Email": email}, {"$set": {"favouriteMovie": movie.movie_id}})

    return {"msg": "Favorite movie updated successfully"}

#Get Favourite Movie ID
@app.get("/movie/favmovie", response_model=FavouriteMovie)
async def get_fav_movie(token: str = Depends(oauth2_scheme)):
    try:
        # Decode the JWT token to get the user's email
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Could not validate credentials")
    except JWTError:
        raise HTTPException(status_code=401, detail="Could not validate credentials")

    #print (email)
    # Fetch the user from the database using the email
    db_user = await user.find_one({"Email": email})
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    # Fetch the favorite movie ID
    favorite_movie_id = db_user.get("favouriteMovie")
    
    #print(f"Favorite movie ID: {favorite_movie_id} (Type: {type(favorite_movie_id)})")

    if favorite_movie_id is None or not isinstance(favorite_movie_id, int):
        raise HTTPException(status_code=404, detail="No valid Movie ID found")

    # Return the favorite movie ID wrapped in the FavouriteMovie model
    return FavouriteMovie(movie_id=favorite_movie_id)


# Get Searched Movie IDs
@app.get("/movie/searched")
async def get_searched_movies(token: str = Depends(oauth2_scheme)):
    try:
        # Decode the JWT token to get the user's email
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Could not validate credentials")
    except JWTError:
        raise HTTPException(status_code=401, detail="Could not validate credentials")

    # Fetch the user from the database using the email
    db_user = await user.find_one({"Email": email})
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    # Fetch the searchedMovie list
    searched_movie_ids = db_user.get("searchedMovie")

    # Check if searchedMovie exists and is a list
    if searched_movie_ids is None or not isinstance(searched_movie_ids, list):
        raise HTTPException(status_code=404, detail="No valid searched movies found")

    # Return the searched movie IDs as a JSON response
    return {"searchedMovie": searched_movie_ids}
    
    
 #Post Searched Movie ID
@app.post("/movie/save-searched-movie")
async def update_searched_movie(movie: FavouriteMovie, token: str = Depends(oauth2_scheme)):
    try:
        # Decode the JWT token to get the user's email
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Could not validate credentials")
    except JWTError:
        raise HTTPException(status_code=401, detail="Could not validate credentials")

    # Fetch the user from the database using the email
    db_user = await user.find_one({"Email": email})
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
        
        
    # Fetch the current search history and favorite movie
    searched_movie = db_user.get("searchedMovie", [])
    favourite_movie = db_user.get("favouriteMovie", None)  # Assume it's an int (movie_id)

    # Check if the movie_id already exists in searchedMovie or favouriteMovie
    if movie.movie_id in searched_movie:
        return {"msg": "Movie already exists in search history"}
    
    if favourite_movie == movie.movie_id:
        return {"msg": "Movie already exists in favorite history"}

    # Insert the new movie_id at the start of the search history
    searched_movie.insert(0, movie.movie_id)

    # Limit the history to the last 5 movie_ids
    if len(searched_movie) > 5:
        searched_movie = searched_movie[:5]

    # Update the user document with the new search history
    await user.update_one({"Email": email}, {"$set": {"searchedMovie": searched_movie}})
    
    return {"msg": "Search history updated successfully"}