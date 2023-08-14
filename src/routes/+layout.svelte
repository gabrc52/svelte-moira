<script lang="ts">
	import { page } from '$app/stores';
	import { loginWebathena } from '$lib/webathena';
	import { setContext, onDestroy } from 'svelte';
	import { writable, derived } from 'svelte/store';
	import { encodeTicket } from '$lib/webathena';
	import { persisted } from 'svelte-local-storage-store';
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';

	import 'bootstrap/dist/css/bootstrap.min.css';
	import 'bootstrap/dist/js/bootstrap.bundle.min.js';

	const routes = [
		// {path: '/', name: 'Home'},
		{ path: `${base}/lists`, name: 'My lists' },
		{ path: `${base}/me`, name: 'About me' }
	];

	// TODO: sensible behavior when ticket expires

	const webathena = persisted<any>('webathena', null);
	setContext('webathena', webathena);

	const ticket = derived(webathena, encodeTicket);
	setContext('ticket', ticket);

	$: console.log($webathena);

	async function login() {
		$webathena = await loginWebathena();
	}

	const theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
	if (theme === 'dark') {
		document.documentElement.setAttribute('data-bs-theme', 'dark');
	} else {
		document.documentElement.setAttribute('data-bs-theme', 'light');
	}

	let searchQuery: string = '';
</script>

<header class="sticky-top">
	<nav class="navbar navbar-expand-md bg-body-tertiary">
		<div class="container">
			<a class="navbar-brand" href={`${base}/`}>MoiraVerse</a>
			<button
				class="navbar-toggler"
				type="button"
				data-bs-toggle="collapse"
				data-bs-target="#moiraNav"
				aria-controls="moiraNav"
				aria-expanded="false"
				aria-label="Toggle navigation"
			>
				<span class="navbar-toggler-icon" />
			</button>
			<div class="collapse navbar-collapse" id="moiraNav">
				<ul class="navbar-nav me-auto">
					{#each routes as route}
						<li class="nav-item">
							<a
								href={route.path}
								aria-current={route.path === $page.url.pathname}
								class:active={route.path === $page.url.pathname}
								class="nav-link">{route.name}</a
							>
						</li>
					{/each}
				</ul>
				<div class="input-group me-2 w-auto" role="search">
					<input
						class="form-control"
						type="search"
						placeholder="Find a List"
						aria-label="Find a List"
						aria-describedby="button-searchlist"
						id="searchlist"
						bind:value={searchQuery}
						on:keydown={(e) =>
							e.key == 'Enter' ? document.getElementById('button-searchlist')?.click() : null}
					/>

					<button
						class="btn btn-secondary"
						type="button"
						id="button-searchlist"
						on:click={() => {
							if (searchQuery.trim().length > 0) {
								goto(`${base}/lists/${searchQuery.trim()}`);
							}
						}}>Go</button
					>
				</div>

				<a
					class="btn btn-success me-2"
					type="button"
					id="button-searchlist"
					href="https://listmaker.mit.edu/lc"
					target="_blank">Create a New List</a>

				<button
					type="button"
					class="btn btn-info me-2"
					data-bs-toggle="modal"
					data-bs-target="#helpModal"
				>
					Help
				</button>

				{#if $webathena === null}
					<button type="button" class="btn btn-primary" id="login" on:click={login}>Login</button>
				{:else}
					<button
						type="button"
						class="btn btn-danger"
						id="logout"
						on:click={() => ($webathena = null)}>Logout</button
					>
				{/if}
			</div>
		</div>
	</nav>
</header>

<div
	class="modal fade"
	id="helpModal"
	tabindex="-1"
	aria-labelledby="helpModalLabel"
	aria-hidden="true"
>
	<div class="modal-dialog modal-dialog-scrollable">
		<div class="modal-content">
			<div class="modal-header">
				<h1 class="modal-title fs-5" id="helpModalLabel">MoiraVerse Help</h1>
				<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" />
			</div>
			<div class="modal-body">...</div>
		</div>
	</div>
</div>

<main>
	<div class="container mt-3">
		<slot />
	</div>
</main>

<footer class="mt-auto text-center">
	<small> Brought to you by SIPB. </small>
</footer>
