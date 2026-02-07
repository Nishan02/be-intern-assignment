#!/bin/bash

# Base URLs
USERS_URL="http://localhost:3000/api/users"
# new post and search urls
POSTS_URL="http://localhost:3000/api/posts"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print section headers
print_header() {
    echo -e "\n${GREEN}=== $1 ===${NC}"
}

# Function to make API requests
make_request() {
    local method=$1
    local endpoint=$2
    local data=$3
    # adding auth header helper
    local user_id=$4
    
    echo "Request: $method $endpoint"
    if [ -n "$data" ]; then
        echo "Data: $data"
    fi
    
    # send request with optional auth id
    if [ "$method" = "GET" ]; then
        curl -s -X $method "$endpoint" -H "x-user-id: $user_id" | jq .
    else
        curl -s -X $method "$endpoint" -H "Content-Type: application/json" -H "x-user-id: $user_id" -d "$data" | jq .
    fi
    echo ""
}

# User-related functions
test_get_all_users() {
    print_header "Testing GET all users"
    make_request "GET" "$USERS_URL"
}

test_get_user() {
    print_header "Testing GET user by ID"
    read -p "Enter user ID: " user_id
    make_request "GET" "$USERS_URL/$user_id"
}

test_create_user() {
    print_header "Testing POST create user"
    read -p "Enter first name: " firstName
    read -p "Enter last name: " lastName
    read -p "Enter email: " email
    
    local user_data=$(cat <<EOF
{
    "firstName": "$firstName",
    "lastName": "$lastName",
    "email": "$email"
}
EOF
)
    make_request "POST" "$USERS_URL" "$user_data"
}

test_update_user() {
    print_header "Testing PUT update user"
    read -p "Enter user ID to update: " user_id
    read -p "Enter new first name (press Enter to keep current): " firstName
    read -p "Enter new last name (press Enter to keep current): " lastName
    read -p "Enter new email (press Enter to keep current): " email
    
    local update_data="{"
    local has_data=false
    
    if [ -n "$firstName" ]; then
        update_data+="\"firstName\": \"$firstName\""
        has_data=true
    fi
    
    if [ -n "$lastName" ]; then
        if [ "$has_data" = true ]; then
            update_data+=","
        fi
        update_data+="\"lastName\": \"$lastName\""
        has_data=true
    fi
    
    if [ -n "$email" ]; then
        if [ "$has_data" = true ]; then
            update_data+=","
        fi
        update_data+="\"email\": \"$email\""
        has_data=true
    fi
    
    update_data+="}"
    
    make_request "PUT" "$USERS_URL/$user_id" "$update_data"
}

test_delete_user() {
    print_header "Testing DELETE user"
    read -p "Enter user ID to delete: " user_id
    make_request "DELETE" "$USERS_URL/$user_id"
}

# --- New Post & Social Functions ---

# handle follower testing
test_followers() {
    print_header "Testing User Followers"
    read -p "Enter user ID: " user_id
    make_request "GET" "$USERS_URL/$user_id/followers"
}

# handle activity testing
test_activity() {
    print_header "Testing User Activity"
    read -p "Enter user ID: " user_id
    make_request "GET" "$USERS_URL/$user_id/activity"
}

# create a new post
test_create_post() {
    print_header "Testing Create Post"
    read -p "Author User ID (x-user-id): " auth_id
    read -p "Post content: " content
    read -p "Hashtags (e.g. #tag1,#tag2): " tags
    
    # format tags for json
    formatted_tags=$(echo $tags | sed 's/,/","/g' | sed 's/^/"/' | sed 's/$/"/')
    
    local post_data=$(cat <<EOF
{
    "content": "$content",
    "hashtags": [$formatted_tags]
}
EOF
)
    make_request "POST" "$POSTS_URL" "$post_data" "$auth_id"
}

# test the feed
test_feed() {
    print_header "Testing Personalized Feed"
    read -p "Your User ID (x-user-id): " auth_id
    make_request "GET" "$USERS_URL/feed" "" "$auth_id"
}

# hashtag search
test_hashtag() {
    print_header "Testing Hashtag Search"
    read -p "Enter tag: " tag
    make_request "GET" "$POSTS_URL/hashtag/$tag"
}

# follow action
test_follow() {
    print_header "Testing Follow User"
    read -p "Your User ID (x-user-id): " auth_id
    read -p "Target User ID to follow: " target_id
    make_request "POST" "$USERS_URL/$target_id/follow" "" "$auth_id"
}

# Submenu functions
show_users_menu() {
    echo -e "\n${GREEN}Users Menu${NC}"
    echo "1. Get all users"
    echo "2. Get user by ID"
    echo "3. Create new user"
    echo "4. Update user"
    echo "5. Delete user"
    echo "6. Get Followers list"
    echo "7. Get Activity history"
    echo "8. Follow a user"
    echo "9. Back to main menu"
    echo -n "Enter your choice (1-9): "
}

# posts submenu
show_posts_menu() {
    echo -e "\n${GREEN}Posts & Social Menu${NC}"
    echo "1. Create a post"
    echo "2. View Personalized Feed"
    echo "3. Search by Hashtag"
    echo "4. Back to main menu"
    echo -n "Enter your choice (1-4): "
}

# Main menu
show_main_menu() {
    echo -e "\n${GREEN}API Testing Menu${NC}"
    echo "1. Users & Social"
    echo "2. Posts & Feeds"
    echo "3. Exit"
    echo -n "Enter your choice (1-3): "
}

# Main loop
while true; do
    show_main_menu
    read choice
    case $choice in
        1)
            while true; do
                show_users_menu
                read user_choice
                case $user_choice in
                    1) test_get_all_users ;;
                    2) test_get_user ;;
                    3) test_create_user ;;
                    4) test_update_user ;;
                    5) test_delete_user ;;
                    6) test_followers ;;
                    7) test_activity ;;
                    8) test_follow ;;
                    9) break ;;
                    *) echo "Invalid choice. Please try again." ;;
                esac
            done
            ;;
        2)
            while true; do
                show_posts_menu
                read post_choice
                case $post_choice in
                    1) test_create_post ;;
                    2) test_feed ;;
                    3) test_hashtag ;;
                    4) break ;;
                    *) echo "Invalid choice. Please try again." ;;
                esac
            done
            ;;
        3) echo "Exiting..."; exit 0 ;;
        *) echo "Invalid choice. Please try again." ;;
    esac
done