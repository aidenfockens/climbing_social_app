from app import app, db, ClimbUsers, UserDetails, UserEvents  # Replace with the actual file name
import json
def print_climbusers_table():
    # Use the app context to access the database
    with app.app_context():
        # Query all entries in the ClimbUsers table
        users = ClimbUsers.query.all()

        if not users:
            print("No users found in the ClimbUsers table.")
        else:
            print(f"{len(users)} user(s) found in the ClimbUsers table:")
            for user in users:
                print(f"Username: {user.username}, Email: {user.email}")

def print_UserDetails_table():
    # Use the app context to access the database
    with app.app_context():
        # Query all entries in the UserDetails table
        users = UserDetails.query.all()

        if not users:
            print("No users found in the UserDetails table.")
        else:
            print(f"{len(users)} user(s) found in the UserDetails table:")
            for user in users:
                print(
                    f"UserDetails("
                    f"username={user.username}, "
                    f"age={user.age}, "
                    f"name={user.name}, "
                    f"location={user.location}, "
                    f"years_climbing={user.years_climbing}, "
                    f"rope={user.rope}, "
                    f"quickdraws={user.quickdraws}, "
                    f"tradGear={user.tradGear}, "
                    f"toprope={user.toprope}, "
                    f"lead={user.lead}, "
                    f"trad={user.trad}, "
                    f"picture_url={user.picture_url})"
                )

def print_UserEvents_table():
    # Use the app context to access the database
    with app.app_context():
        # Query all entries in the UserEvents table
        events = UserEvents.query.all()
        if not events:
            print("No events found in the UserEvents table.")
        else:
            print("UserEvents Table:")
            print("=" * 50)
            for event in events:
                print(f"ID: {event.id}")
                print(f"Username: {event.username}")
                print(f"Date: {event.date.strftime('%Y-%m-%d')}")
                print(f"Time: {event.time.strftime('%I:%M %p')}")
                print(f"Location: {event.location}")
                print(f"Description: {event.description}")
                print(f"Visibility: {event.visibility}")
                print(f"Allowed Users: {json.loads(event.allowed_users or '[]')}")
                print(f"Created At: {event.created_at}")
                print("-" * 50)



if __name__ == '__main__':
    print_climbusers_table()
    print_UserDetails_table()
    print_UserEvents_table()