package main

import (
	"log"
	"net/http"
	"os"

	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/plugins/migratecmd"

	_ "svelte-bot-db/migrations"
)

func main() {
	app := pocketbase.New()

	migratecmd.MustRegister(app, app.RootCmd, migratecmd.Config{
		Automigrate: true,
	})

	app.OnServe().BindFunc(func(se *core.ServeEvent) error {
		se.Router.GET("/api/sdb/increment-solve-count/{userId}", func(e *core.RequestEvent) error {
			userId := e.Request.PathValue("userId")

			_, err := app.FindFirstRecordByFilter(
				"threadSolves", "user_id = {:userId}",
				dbx.Params{"userId": userId},
			)

			if err != nil {
				threadSolvesCollection, err := app.FindCollectionByNameOrId("threadSolves")
				if err != nil {
					return err
				}

				record := core.NewRecord(threadSolvesCollection)
				record.Set("user_id", userId)
				record.Set("count", 0)

				app.Save(record)
			}

			_, err = app.
				DB().
				NewQuery("UPDATE threadSolves SET count = count + 1 WHERE user_id = {:userId}").
				Bind(dbx.Params{"userId": userId}).
				Execute()

			if err != nil {
				return err
			}

			return e.String(http.StatusOK, "Incremented")
		}).Bind(apis.RequireSuperuserAuth())

		// serves static files from the provided public dir (if exists)
		se.Router.GET("/{path...}", apis.Static(os.DirFS("./pb_public"), false))

		return se.Next()
	})

	if err := app.Start(); err != nil {
		log.Fatal(err)
	}
}
