package main

import (
	"log"

	"github.com/labstack/echo/v5"
	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/forms"
	"github.com/pocketbase/pocketbase/models"
	"github.com/pocketbase/pocketbase/plugins/migratecmd"

	_ "svelte-bot-db/migrations"
)

func main() {
	app := pocketbase.New()

	migratecmd.MustRegister(app, app.RootCmd, migratecmd.Config{
		Automigrate: true,
	})

	app.OnBeforeServe().Add(func(e *core.ServeEvent) error {
		e.Router.GET("/api/sdb/increment-solve-count/:userId", func(c echo.Context) error {
			userId := c.PathParam("userId")

			_, err := app.Dao().FindFirstRecordByFilter(
				"threadSolves", "user_id = {:userId}",
				dbx.Params{"userId": userId},
			)

			if err != nil {
				threadSolvesCollection, err := app.Dao().FindCollectionByNameOrId("threadSolves")
				if err != nil {
					return err
				}

				record := models.NewRecord(threadSolvesCollection)
				form := forms.NewRecordUpsert(app, record)

				form.LoadData(map[string]any{
					"user_id": userId,
					"count":   0,
				})

				if err := form.Submit(); err != nil {
					return err
				}
			}

			_, err = app.Dao().
				DB().
				NewQuery("UPDATE threadSolves SET count = count + 1 WHERE user_id = {:userId}").
				Bind(dbx.Params{"userId": userId}).
				Execute()

			if err != nil {
				return err
			}

			return c.String(200, "Incremented")
		}, apis.ActivityLogger(app), apis.RequireAdminAuth())

		return nil
	})

	if err := app.Start(); err != nil {
		log.Fatal(err)
	}
}
