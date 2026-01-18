/// <reference lib="webworker" />

import { UserResult } from './models/api-result.model';

addEventListener('message', ({ data }) => {
  const { action, users, groupBy, filterTerm } = data;

  if (action === 'PROCESS_USERS') {
    const processed = processUsers(users, groupBy, filterTerm);
    postMessage(processed);
  }
});

function processUsers(
  rawUsers: UserResult[],
  groupByAttribute: string,
  filterTerm: string
) {
  const natCounts: Record<string, number> = {};
  rawUsers.forEach((u) => {
    natCounts[u.nat] = (natCounts[u.nat] || 0) + 1;
  });

  let activeUsers = rawUsers;

  if (filterTerm) {
    const term = filterTerm.toLowerCase();
    activeUsers = rawUsers.filter(
      (u) =>
        u.name.first.toLowerCase().includes(term) ||
        u.name.last.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term)
    );
  }

  const mappedUsers = activeUsers.map((user) => ({
    firstname: user.name.first,
    lastname: user.name.last,
    email: user.email,
    phone: user.phone,
    nat: user.nat,
    natCount: natCounts[user.nat] || 0,
    imageSrc: `${user.picture.medium}?id=${user.login.uuid}`,
    fullData: user,
  }));

  const groups: Record<string, any[]> = {};

  mappedUsers.forEach((user) => {
    let key = 'Other';

    if (groupByAttribute === 'nat') {
      key = user.nat;
    } else if (groupByAttribute === 'alpha') {
      key = user.firstname.charAt(0).toUpperCase();
    }

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
