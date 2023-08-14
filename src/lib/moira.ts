import { PUBLIC_MOIRA_API } from '$env/static/public';
import type { HttpMethod, UserInfo, Belonging, ListInfo, ListMembers } from '$lib/types';

// TODO: allow other input
// GET parameters
// and JSON body

type QueryOptions = { method: HttpMethod; path: string; ticket: string };

async function _makeQuery({ method, path, ticket }: QueryOptions): Promise<any> {
	const response = await fetch(`${PUBLIC_MOIRA_API}${path}`, {
		headers: {
			Authorization: `webathena ${ticket}`
		},
		method
	});
	console.log(response);
	const json = await response.json();
	if (response.status !== 200) {
		// TODO check is instance of MoiraException?
		throw json;
	}
	return json;
}

const memo = new Map<string, any>();

// Some client-side memoization is better than nothing
// but I am not sure if it is the right solution
// TODO: does not work for exceptions
// TODO: add a way of refreshing/invalidating
export async function makeQuery(options: QueryOptions): Promise<any> {
	const hashableOptions = JSON.stringify(options);
	if (!memo.has(hashableOptions)) {
		memo.set(hashableOptions, await _makeQuery(options));
	}
	return memo.get(hashableOptions);
}

export async function getLists(ticket: string): Promise<string[]> {
	const lists: string[] = await makeQuery({
		method: 'GET',
		path: '/users/me/lists',
		ticket
	});
	lists.sort();
	return lists;
}

export async function getUserBelongings(ticket: string): Promise<Belonging[]> {
	const belongings: Belonging[] = await makeQuery({
		method: 'GET',
		path: '/users/me/belongings',
		ticket
	});
	return belongings;
}

export async function getListBelongings(ticket: string, list: string): Promise<Belonging[]> {
	const belongings: Belonging[] = await makeQuery({
		method: 'GET',
		path: `/lists/${list}/belongings`,
		ticket
	});
	return belongings;
}

export async function getUserInfo(ticket: string): Promise<UserInfo> {
	return await makeQuery({
		method: 'GET',
		path: '/users/me/',
		ticket
	});
}

export async function getListInfo(ticket: string, list: string): Promise<ListInfo> {
	return await makeQuery({
		method: 'GET',
		path: `/lists/${list}/`,
		ticket
	});
}

export async function getListMembers(ticket: string, list: string): Promise<ListMembers> {
	return await makeQuery({
		method: 'GET',
		path: `/lists/${list}/members/`,
		ticket
	});
}

export async function getListLists(ticket: string, list: string): Promise<string[]> {
	return await makeQuery({
		method: 'GET',
		path: `/lists/${list}/lists`,
		ticket
	});
}
