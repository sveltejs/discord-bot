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
		threadSolvesData := `{
			"id": "tn4t8pzh448d674",
			"created": "2024-10-31 03:33:50.146Z",
			"updated": "2024-10-31 03:33:50.146Z",
			"name": "threadSolves",
			"type": "base",
			"system": false,
			"schema": [
				{
					"system": false,
					"id": "tqe9e1ik",
					"name": "user_id",
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
					"id": "galb9ert",
					"name": "count",
					"type": "number",
					"required": false,
					"presentable": false,
					"unique": false,
					"options": {
						"min": 0,
						"max": null,
						"noDecimal": true
					}
				}
			],
			"indexes": [
				"CREATE UNIQUE INDEX ` + "`" + `idx_Wdx95vJ` + "`" + ` ON ` + "`" + `thread_solves` + "`" + ` (` + "`" + `user_id` + "`" + `)"
			],
			"listRule": null,
			"viewRule": null,
			"createRule": null,
			"updateRule": null,
			"deleteRule": null,
			"options": {}
		}`

		threadSolvesCollection := &models.Collection{}
		if err := json.Unmarshal([]byte(threadSolvesData), &threadSolvesCollection); err != nil {
			return err
		}

		if err := daos.New(db).SaveCollection(threadSolvesCollection); err != nil {
			return err
		}

		leaderboardData := `{
			"id": "i0vp31j3wwgak0u",
			"created": "2024-10-31 03:41:35.465Z",
			"updated": "2024-10-31 03:41:35.465Z",
			"name": "leaderboard",
			"type": "view",
			"system": false,
			"schema": [
				{
					"system": false,
					"id": "pmjhypaj",
					"name": "user_id",
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
					"id": "amvyvs1f",
					"name": "count",
					"type": "number",
					"required": false,
					"presentable": false,
					"unique": false,
					"options": {
						"min": 0,
						"max": null,
						"noDecimal": true
					}
				}
			],
			"indexes": [],
			"listRule": null,
			"viewRule": null,
			"createRule": null,
			"updateRule": null,
			"deleteRule": null,
			"options": {
				"query": "SELECT\n  id, user_id, count\nFROM threadSolves\nORDER BY count\n  DESC\nLIMIT 10"
			}
		}`

		leaderboardCollection := &models.Collection{}
		if err := json.Unmarshal([]byte(leaderboardData), &leaderboardCollection); err != nil {
			return err
		}

		return daos.New(db).SaveCollection(leaderboardCollection)
	}, func(db dbx.Builder) error {
		dao := daos.New(db)

		leaderboardCollection, err := dao.FindCollectionByNameOrId("i0vp31j3wwgak0u")
		if err != nil {
			return err
		}

		if err := dao.DeleteCollection(leaderboardCollection); err != nil {
			return err
		}

		threadSolvesCollection, err := dao.FindCollectionByNameOrId("tn4t8pzh448d674")
		if err != nil {
			return err
		}

		return dao.DeleteCollection(threadSolvesCollection)
	})
}
