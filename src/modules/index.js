import React from "react";
import gql from "graphql-tag";
import Thread from "./Thread";
import { useScrollToTop } from "../common/useScrollToTop";
import { useQuery } from '../graphql-client/useQuery';

const THREADS_QUERY = gql`
  query($sortBy: SortBy!, $skip: Int, $limit: Int) {
    threads(sortBy: $sortBy, limit: $limit, skip: $skip) {
      id
      text
      title
      createdBy {
        id
        username
      }
      createdAt
      hasUserLiked
      likesNumber
      repliesNumber
    }
  }
`;

const Home = () => {
  useScrollToTop();

  const { data, errors, fetching } = useQuery({
    query: THREADS_QUERY,
    variables: { sortBy: 'LATEST', skip: 0, limit: 10 },
  });

  console.log("data", data);
  console.log("errors", errors);
  console.log("fetching", fetching);

  if (fetching) return <p>Loading...</p>;
  if (errors) return <p>Errors {errors.error[0]}</p>;

  return (
    <div>
      {data.threads.map(thread => (
        <Thread key={thread.id} {...thread} />
      ))}
    </div>
  );
};

export default Home;
