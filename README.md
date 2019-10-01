# Egendata operator

![License](https://flat.badgen.net/github/license/egendata/operator)
![Dependabot](https://flat.badgen.net/dependabot/egendata/operator?icon=dependabot)
![Travis CI](https://flat.badgen.net/travis/egendata/operator?icon=travis)
![Github release](https://flat.badgen.net/github/release/egendata/operator?icon=github)

Backend for managing consents and data flow

## What data is stored and where?

- Personal data is stored encrypted in the `PDS` (eg. Dropbox) specified by the user
- Metadata (consents, permissions, id:s) and client data are stored in `Postgres` (this will probably change)
- Temporary consent requests are stored in `Redis`
- Requests and errors are logged in `elasticsearch/APM` for debugging purposes in test/dev

## Configuration

The application runs with default cofiguration if `NODE_ENV` is `development`
(default) or `test` (default when running tests). When running in `production`
these environment variables *must* be set or the application will not start.

These variables may optionally be overridden in an `.env` file on your dev
machine.

```
# Run mode: development|test|production
NODE_ENV=development

# Host port, defaults to 3000
PORT=3000
# Full host address, defaults to http://[your ip]:[port]
HOST=https://myservice.work

# Postgres
PGHOST='postgres-service'
PGPORT='5432'
PGUSER='some-username'
PGPASSWORD='some-very-secret-password'
PGDATABASE='egendata'

# Application performance management. turned off if val is ''
APM_SERVER=http://apm-service:8200
APM_TOKEN=mysecrettoken

# Operator key (generate your own!!!)
PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\nMIICXQIBAAKBgQDgR0M9RBFT26AseaNYy9g5YX+YQhbskFTAp0aCO6h/8xPAOzkd\n7sO+Lqrx4Ljs8iuUTv7JUbx8+ml+7IMKYjpFx4eFQ1kcEW9IL5xSKKcHt2O359cy\n5KbBExqj4Fr2JkmCE+XcMJa5GGOnpNKB92pmJtfOkjVBVQ280n/j8suyCwIDAQAB\nAoGBAMwGqBl86ZJy0nSDN2EZF5ujoXJ+dOJBrogP5CmnYfL7y3Ttq1kakwFY7PPb\nLf+HkrN5ZXj5HVJIb14ihFcW4tBR2EtABhuv2J6ZNx0KnDxUj+mJlb7GNgr5eayI\nUibIu8/eQh2+CGMilI/KR8zlRiHpD8BgttfBaRktGIrzklQJAkEA9C8JgnAGUbPp\n3rc3dEZR6pEcOGI5Fjo3uvhbOYO5oa4tJszNF1Fh1oUmn17J6yoMnh0qPG4snL2B\nOgSB8OCOnwJBAOshovf7obbVZFzQ7ikYImT/pqz7f7eV1+Uv1MRfGsXAc0EAXDrh\nAPiJ5icWkeRDCFxaTAy/8lrDGgDcL2CSoRUCQQCem4L4x91C6rMJaEbL7vU8gL8s\n3JgqGOykNLfElwxXubQ4VKUO9Vywo9JfiIlth+WkOlt53zJ5KRqsXcstdB8PAkAo\nw6IfYA6/Reuqc8Z2dWqxG+lnoAqaZ24Qm+RFTz+y/RR+NnPG+W9Tp4SxTiZo7n4q\nlLUOmNCJj72YXJQSKBmpAkAyDc4PrJ3nFt45BOEnRuXE60Lv3VzLPdWggOLcKTbW\nr6NAWQS0VNdXEmJVmdoKFhJAeUvLrXPtBGqPS7HO6A8A\n-----END RSA PRIVATE KEY-----\n"
```

## Logging

The Operator is instrumented to use [Elastic APM](https://www.elastic.co/products/apm)
for performance and error logging.
