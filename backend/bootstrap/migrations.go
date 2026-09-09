package bootstrap

import (
	"github.com/goravel/framework/contracts/database/schema"

	"github.com/polibee/go-reactrouter/backend/database/migrations"
)

func Migrations() []schema.Migration {
	return []schema.Migration{
		&migrations.M20210101000001CreateJobsTable{},
		&migrations.M20260908000001CreateCoreTables{},
		&migrations.M20260909000001CreatePluginTables{},
	}
}
