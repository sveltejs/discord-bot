package migrations

import (
	"encoding/json"

	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase/daos"
	m "github.com/pocketbase/pocketbase/migrations"
	"github.com/pocketbase/pocketbase/models"
)

func init() {
	m.Register(func(db dbx.Builder) error {
		jsonData := `{
			"id": "8w61cfude7iz5yr",
			"created": "2024-10-30 23:18:37.306Z",
			"updated": "2024-10-30 23:18:37.306Z",
			"name": "tags",
			"type": "base",
			"system": false,
			"schema": [
				{
					"system": false,
					"id": "9mvg0sxo",
					"name": "author_id",
					"type": "text",
					"required": true,
					"presentable": false,
					"unique": false,
					"options": {
						"min": 1,
						"max": null,
						"pattern": ""
					}
				},
				{
					"system": false,
					"id": "pzmn4w7n",
					"name": "name",
					"type": "text",
					"required": true,
					"presentable": true,
					"unique": false,
					"options": {
						"min": 1,
						"max": 255,
						"pattern": ""
					}
				},
				{
					"system": false,
					"id": "mgltfgjn",
					"name": "content",
					"type": "text",
					"required": true,
					"presentable": false,
					"unique": false,
					"options": {
						"min": 1,
						"max": null,
						"pattern": ""
					}
				}
			],
			"indexes": [
				"CREATE UNIQUE INDEX ` + "`" + `idx_z6Heg29` + "`" + ` ON ` + "`" + `tags` + "`" + ` (` + "`" + `name` + "`" + `)"
			],
			"listRule": null,
			"viewRule": null,
			"createRule": null,
			"updateRule": null,
			"deleteRule": null,
			"options": {}
		}`

		collection := &models.Collection{}
		if err := json.Unmarshal([]byte(jsonData), &collection); err != nil {
			return err
		}

		return daos.New(db).SaveCollection(collection)
	}, func(db dbx.Builder) error {
		dao := daos.New(db)

		collection, err := dao.FindCollectionByNameOrId("8w61cfude7iz5yr")
		if err != nil {
			return err
		}

		return dao.DeleteCollection(collection)
	})
}
