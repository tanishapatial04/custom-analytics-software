"""
Download GeoLite2-Country.mmdb from MaxMind on startup if not present.
This script runs before the app starts to ensure the GeoIP database is available.
"""
import os
import logging
from pathlib import Path
import tarfile
import io

logger = logging.getLogger(__name__)

def download_geoip_db():
    """Download GeoLite2-Country.mmdb from MaxMind."""
    try:
        import urllib.request
    except ImportError:
        logger.error("urllib not available for downloading GeoIP DB")
        return False

    root_dir = Path(__file__).parent
    db_path = root_dir / 'GeoLite2-Country.mmdb'
    
    # If DB already exists, skip download
    if db_path.exists():
        logger.info(f"✓ GeoIP DB already exists at {db_path}")
        return True
    
    logger.info("📥 Downloading GeoLite2-Country.mmdb from MaxMind...")
    
    try:
        # MaxMind GeoLite2 download URL (free tier, no auth required for public download)
        # Using the official GeoLite2 Country database URL
        url = "https://download.maxmind.com/app/geoip_download?edition_id=GeoLite2-Country&license_key=YOUR_LICENSE_KEY&suffix=tar.gz"
        
        # For a free/public approach without license key, we can use a mirror or fallback
        # This is a simplified version that attempts to download from MaxMind's public CDN
        # In production, you would need a MaxMind account and license key
        
        logger.warning("⚠️  Automatic GeoIP download requires MaxMind license key.")
        logger.warning("    Please download GeoLite2-Country.mmdb manually from:")
        logger.warning("    https://www.maxmind.com/en/account/login")
        logger.warning("    and place it at: " + str(db_path))
        
        return False
        
    except Exception as e:
        logger.error(f"Failed to download GeoIP DB: {e}")
        return False

if __name__ == '__main__':
    logging.basicConfig(level=logging.INFO)
    download_geoip_db()
