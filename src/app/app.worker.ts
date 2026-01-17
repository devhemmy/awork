/// <reference lib="webworker" />

import { UserResult } from './models/api-result.model';

addEventListener('message', ({ data }) => {
  const { action, users, groupBy } = data;

  if (action === 'PROCESS_USERS') {
    const processed = processUsers(users, groupBy);
    postMessage(processed);
  }
});

function processUsers(rawUsers: UserResult[], groupByAttribute: string) {
  const natCounts: Record<string, number> = {};

  rawUsers.forEach((u) => {
    const key = u.nat;
    natCounts[key] = (natCounts[key] || 0) + 1;
  });

  const mappedUsers = rawUsers.map((user) => ({
    firstname: user.name.first,
    lastname: user.name.last,
    email: user.email,
    phone: user.phone,
    nat: user.nat,
    natCount: natCounts[user.nat] || 0,
    imageSrc: `${user.picture.medium}?id=${user.login?.uuid}`,
    fullData: user, // the original data for expansion details later
  }));

  const groups: Record<string, any[]> = {};

  mappedUsers.forEach((user) => {
    // @ts-ignore
    const key = user[groupByAttribute] || 'Other';

    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(user);
  });

  const groupArray = Object.keys(groups)
    .sort()
    .map((key) => ({
      title: key,
      users: groups[key],
    }));

  return {
    allUsers: mappedUsers,
    groupedUsers: groupArray,
  };
}
