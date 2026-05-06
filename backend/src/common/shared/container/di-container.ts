// shared/container/di-container.ts

import type {
  ClassConstructor,
  InjectionToken,
  ProviderDefinition,
} from "../module/module.types";

type InjectableClass<T extends object = object> = ClassConstructor<T> & {
  inject?: InjectionToken[];
};

export class DIContainer {
  private readonly instances = new Map<InjectionToken, unknown>();
  private readonly providers = new Map<InjectionToken, ProviderDefinition>();

  register(providers: ProviderDefinition[]): void {
    for (const provider of providers) {
      this.providers.set(provider.token, provider);
    }
  }

  resolve<T>(token: InjectionToken<T>): T {
    const existingInstance = this.instances.get(token);

    if (existingInstance) {
      return existingInstance as T;
    }

    const provider = this.providers.get(token);

    if (provider && "useValue" in provider) {
      this.instances.set(token, provider.useValue);

      return provider.useValue as T;
    }

    const targetClass = (
      provider && "useClass" in provider ? provider.useClass : token
    ) as InjectableClass;

    if (typeof targetClass !== "function") {
      throw new Error(`Provider nao encontrado para token: ${String(token)}`);
    }

    const dependencies =
      targetClass.inject?.map((dependency) => this.resolve(dependency)) ?? [];

    const instance = new targetClass(...dependencies);

    this.instances.set(token, instance);

    return instance as T;
  }
}
