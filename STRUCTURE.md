backend/
├── prisma/
│ ├── migrations/
│ │ ├── 20261009013318_init/
│ │ │ └── migration.sql
│ │ └── migration_lock.toml
│ └── schema.prisma
├── src/
│ ├── auth/
│ │ ├── guards/
│ │ │ ├── auth.guard.spec.ts
│ │ │ └── auth.guard.ts
│ │ ├── strategies/
│ │ │ ├── steam.service.spec.ts
│ │ │ └── steam.strategy.ts
│ │ ├── auth.controller.spec.ts
│ │ ├── auth.controller.ts
│ │ ├── auth.module.ts
│ │ ├── auth.serializer.ts
│ │ ├── auth.service.spec.ts
│ │ └── auth.service.ts
│ ├── generated/
│ ├── prisma/
│ │ ├── prisma.module.ts
│ │ ├── prisma.service.spec.ts
│ │ └── prisma.service.ts
│ ├── types/
│ │ └── dessly-passport-steam.d.ts
│ ├── users/
│ │ ├── users.module.ts
│ │ ├── users.service.spec.ts
│ │ └── users.service.ts
│ ├── app.controller.spec.ts
│ ├── app.controller.ts
│ ├── app.module.ts
│ ├── app.service.ts
│ └── main.ts
├── test/
│ └── app.e2e-spec.ts
├── .gitignore
├── .prettierrc
├── bun.lock
├── docker-compose.yml
├── nest-cli.json
├── oxlint.json
├── package.json
├── prisma7.config.ts
├── README.md
├── skills-lock.json
├── tsconfig.build.json
├── tsconfig.json
├── vitest.config.e2e.ts
└── vitest.config.ts
