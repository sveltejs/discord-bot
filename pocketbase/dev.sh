if [[ ${PWD##*/} != "pocketbase" ]]; then
    cd pocketbase || exit 1
fi

echo "Applying migrations..."
go run main.go migrate up
echo "Adding admin user..."
go run main.go admin create dev@local.host testtest &>/dev/null
echo "Starting..."
go run main.go serve
