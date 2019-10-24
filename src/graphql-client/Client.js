import { fetchExchange } from "./fetchExchange";
import { dedupExchange } from "./dedupExchange";
import { composeExchanges } from "./composeExchange";
import { cacheExchange } from "./cacheExchange";

export class Client {
  constructor(url, opts = {}) {
    this.context = {
      url,
      fetch: opts.fetch || window.fetch.bind(window),
      fetchOptions: opts.fetchOptions || {},
      requestPolicy: opts.requestPolicy || "cache-first"
    };
    const exchanges = opts.exchanges || [
      dedupExchange,
      cacheExchange,
      fetchExchange
    ];
    this.sendOperation = composeExchanges(this, exchanges)(this.onResult);
    this.listeners = {};
  }

  onOperationStart = (operation, cb) => {
    const { key } = operation;
    const listeners = this.listeners[key] || (this.listeners[key] = new Set());
    listeners.add(cb);
    this.sendOperation(operation);
  };

  onOperationEnd = (operation, cb) => {
    const { key } = operation;
    const listeners = this.listeners[key] || (this.listeners[key] = new Set());
    listeners.delete(cb);
    if (listeners.size === 0) {
      this.sendOperation({ ...operation, operationName: "teardown" });
    }
  };

  onResult = result => {
    const { key } = result.operation;
    const listeners = this.listeners[key] || (this.listeners[key] = new Set());
    listeners.forEach(listener => listener(result));
  };

  reexecute = operation => {
    const { key } = operation;
    const listeners = this.listeners[key] || (this.listeners[key] = new Set());
    if (listeners.size > 0) {
      this.sendOperation(operation);
    }
  };

  execute = async (baseOperation, cb) => {
    const operation = {
      ...baseOperation,
      context: {
        ...this.context,
        ...baseOperation.context
      }
    };

    this.onOperationStart(operation, cb);
    return () => this.onOperationEnd(operation, cb);

    // try {
    //   const { data, errors } = await executeFetch(this.url, fetchOptions);
    //   cb({
    //     operation,
    //     data,
    //     error: errors ? new CombinedError({ graphQLErrors: errors }) : undefined
    //   })
    // } catch (networkError) {
    //   cb({
    //     operation,
    //     data: undefined,
    //     error: new CombinedError({ networkError })
    //   })
    // }
  };
}
