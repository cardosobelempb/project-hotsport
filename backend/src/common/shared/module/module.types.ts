// shared/module/module.types.ts

export type ClassConstructor<T extends object = object> = new (
  ...args: any[]
) => T;

export type ControllerInstance = object;

export type ProviderDefinition<T extends object = object> = {
  token: ClassConstructor<T>;
  useClass: ClassConstructor<T>;
};

export type ModuleDefinition = {
  providers: ProviderDefinition[];
  controllers: ClassConstructor<ControllerInstance>[];
};
