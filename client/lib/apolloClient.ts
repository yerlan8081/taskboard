import {
  ApolloClient,
  InMemoryCache,
  split,
  createHttpLink,
  ApolloLink
} from '@apollo/client';
import { getMainDefinition } from '@apollo/client/utilities';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';

export function createApolloClient(token: string | null) {
  const httpUri = process.env.NEXT_PUBLIC_GRAPHQL_HTTP || 'http://localhost:4000/graphql';
  const wsUri = process.env.NEXT_PUBLIC_GRAPHQL_WS || httpUri.replace(/^http/, 'ws');

  const httpLink = createHttpLink({
    uri: httpUri
  });

  const authLink = new ApolloLink((operation, forward) => {
    if (token) {
      operation.setContext(({ headers = {} }) => ({
        headers: {
          ...headers,
          Authorization: `Bearer ${token}`
        }
      }));
    }
    return forward ? forward(operation) : null;
  });

  const wsLink =
    typeof window !== 'undefined'
      ? new GraphQLWsLink(
          createClient({
            url: wsUri,
            connectionParams: () => (token ? { Authorization: `Bearer ${token}` } : {})
          })
        )
      : null;

  const splitLink =
    wsLink !== null
      ? split(
          ({ query }) => {
            const definition = getMainDefinition(query);
            return (
              definition.kind === 'OperationDefinition' &&
              (definition as any).operation === 'subscription'
            );
          },
          wsLink,
          authLink.concat(httpLink)
        )
      : authLink.concat(httpLink);

  return new ApolloClient({
    link: splitLink,
    cache: new InMemoryCache()
  });
}
