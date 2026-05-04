// shared/container/di-container.ts

import type {
  ClassConstructor,
  ProviderDefinition,
} from "../module/module.types";

type InjectableClass<T extends object = object> = ClassConstructor<T> & {
  inject?: ClassConstructor[];
};

export class DIContainer {
  private readonly instances = new Map<ClassConstructor, object>();
  private readonly providers = new Map<ClassConstructor, ClassConstructor>();

  register(providers: ProviderDefinition[]): void {
    for (const provider of providers) {
      this.providers.set(provider.token, provider.useClass);
    }
  }

  resolve<T extends object>(token: ClassConstructor<T>): T {
    const existingInstance = this.instances.get(token);

    if (existingInstance) {
      return existingInstance as T;
    }

    const targetClass = (this.providers.get(token) ??
      token) as InjectableClass<T>;

    const dependencies =
      targetClass.inject?.map((dependency) => this.resolve(dependency)) ?? [];

    const instance = new targetClass(...dependencies);

    this.instances.set(token, instance);

    return instance;
  }
}
