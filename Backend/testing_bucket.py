import boto3
from botocore.exceptions import NoCredentialsError, PartialCredentialsError, ClientError

# Replace these with your actual AWS credentials and bucket name
AWS_ACCESS_KEY = 'AKIATHVQLI26RM6QYFD4'
AWS_SECRET_KEY = '1dWGyoNkoRSnaETTEH3eUE1ugwcIAhSAa8am/Me2'
BUCKET_NAME = 'userpictures-aidenfockens'
REGION_NAME = 'us-east-2'

def test_s3_connection():
    try:
        # Create S3 client
        s3_client = boto3.client(
            's3',
            aws_access_key_id=AWS_ACCESS_KEY,
            aws_secret_access_key=AWS_SECRET_KEY,
            region_name=REGION_NAME
        )
        
        # List objects in the bucket
        response = s3_client.list_objects_v2(Bucket=BUCKET_NAME)
        
        print(f"Successfully connected to bucket: {BUCKET_NAME}")
        if 'Contents' in response:
            print("Bucket contents:")
            for obj in response['Contents']:
                print(f" - {obj['Key']}")
        else:
            print("Bucket is empty.")
    
    except NoCredentialsError:
        print("No AWS credentials provided. Please check your access and secret keys.")
    except PartialCredentialsError:
        print("Incomplete AWS credentials provided. Please verify both keys.")
    except ClientError as e:
        print(f"Client error: {e}")
    except Exception as e:
        print(f"An error occurred: {e}")

# Run the test
if __name__ == "__main__":
    test_s3_connection()
