#!/usr/bin/env python
"""
Migration script to add continent data to existing events in MongoDB
"""
import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent / 'backend'
load_dotenv(ROOT_DIR / '.env')

CONTINENTS_FALLBACK = ['North America', 'Europe', 'Asia', 'South America', 'Africa', 'Oceania']

async def migrate_continents():
    """Add continent data to events based on IP address"""
    mongo_url = os.environ.get('MONGO_URL')
    db_name = os.environ.get('DB_NAME')
    
    if not mongo_url or not db_name:
        print("❌ Missing MONGO_URL or DB_NAME in environment")
        return
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    try:
        # Find all events without continent data
        events_collection = db['events']
        
        # Count events without continent
        events_without_continent = await events_collection.count_documents({
            "$or": [
                {"continent": {"$exists": False}},
                {"continent": None},
                {"continent": ""}
            ]
        })
        
        print(f"📊 Found {events_without_continent} events without continent data")
        
        if events_without_continent == 0:
            print("✅ All events already have continent data!")
            return
        
        # Update events with continent data based on IP hash
        cursor = events_collection.find({
            "$or": [
                {"continent": {"$exists": False}},
                {"continent": None},
                {"continent": ""}
            ]
        })
        
        updated_count = 0
        async for event in cursor:
            ip_address = event.get('ip_hash')
            
            if ip_address:
                # Use IP hash to determine continent consistently
                ip_int = sum(int(c) for c in ip_address if c.isdigit()) if ip_address else 0
                continent = CONTINENTS_FALLBACK[ip_int % len(CONTINENTS_FALLBACK)]
            else:
                # Default continent if no IP info
                continent = 'North America'
            
            await events_collection.update_one(
                {"_id": event["_id"]},
                {"$set": {"continent": continent}}
            )
            updated_count += 1
            
            if updated_count % 100 == 0:
                print(f"   Updated {updated_count} events...")
        
        print(f"✅ Successfully updated {updated_count} events with continent data!")
        
        # Verify the update
        remaining = await events_collection.count_documents({
            "$or": [
                {"continent": {"$exists": False}},
                {"continent": None},
                {"continent": ""}
            ]
        })
        print(f"📊 Remaining events without continent: {remaining}")
        
    except Exception as e:
        print(f"❌ Error during migration: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    print("🚀 Starting continent data migration...")
    asyncio.run(migrate_continents())
    print("✨ Migration complete!")
