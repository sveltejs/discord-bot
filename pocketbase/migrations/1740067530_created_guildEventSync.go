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
			"id": "qnx3lm934i0qiu9",
			"created": "2025-02-20 16:05:30.595Z",
			"updated": "2025-02-20 16:05:30.595Z",
			"name": "guildEventSync",
			"type": "base",
			"system": false,
			"schema": [
				{
					"system": false,
					"id": "9gnhopdz",
					"name": "event_slug",
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
					"id": "lt2o1zuz",
					"name": "discord_event_id",
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
				"CREATE UNIQUE INDEX ` + "`" + `idx_oH0YuDm` + "`" + ` ON ` + "`" + `guildEventSync` + "`" + ` (` + "`" + `event_slug` + "`" + `)",
				"CREATE UNIQUE INDEX ` + "`" + `idx_SliJ9g4` + "`" + ` ON ` + "`" + `guildEventSync` + "`" + ` (` + "`" + `discord_event_id` + "`" + `)"
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
		dao := daos.New(db);

		collection, err := dao.FindCollectionByNameOrId("qnx3lm934i0qiu9")
		if err != nil {
			return err
		}

		return dao.DeleteCollection(collection)
	})
}
