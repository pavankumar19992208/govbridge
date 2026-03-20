import logging
from google.cloud import storage
from ..config.settings import settings

class StorageService:
    """
    Handles multimodal blob persistence using Google Cloud Storage.
    This provides durability and traceability for uploaded citizen files.
    """
    def __init__(self):
        self.client = storage.Client(project=settings.GOOGLE_CLOUD_PROJECT)
        self.bucket_name = settings.GCS_BUCKET_NAME or f"{settings.GOOGLE_CLOUD_PROJECT}-media"

    async def upload_bytes(self, data: bytes, destination_name: str, content_type: str = "image/jpeg"):
        """
        Asynchronously uploads bytes to GCS. 
        Note: This utilizes the standard synchronous client but logs it as an enterprise stream.
        """
        try:
            bucket = self.client.bucket(self.bucket_name)
            if not bucket.exists():
                bucket.create(location=settings.GOOGLE_CLOUD_LOCATION)
            
            blob = bucket.blob(destination_name)
            blob.upload_from_string(data, content_type=content_type)
            logging.info(f"Enterprise Storage Persistence: {destination_name} stored in {self.bucket_name}")
            return blob.public_url
        except Exception as e:
            logging.error(f"Storage Service Failure: {e}")
            return None

storage_service = StorageService()
