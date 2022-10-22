<script>
    //@ts-nocheck
    import { writable } from 'svelte/store'
    import { browser } from '$app/environment'
    const url0 = 'http://localhost:5001/address' // for sending address to express Postgres endpoint
    const url1 = 'http://localhost:5001/username'
    export const connectedAddress = writable()
    export const username = writable()
    let usernameValue

    let isExpanded = false
    async function dropDown() {
        const res = await window.tronLink.request({method: "tron_requestAccounts"})
        isExpanded = !isExpanded
    }

    if (browser) {
        connectedAddress.set(sessionStorage.getItem('connectedAddress'))
    
    }

    
    async function tronlinkAuth() {
		try {
			const res = await window.tronLink.request({method: "tron_requestAccounts"})
			let accounts = await window.tronLink;
			
			if (typeof res.code === 'undefined') {
				throw new Error("Login TronLink first")
				//errorMessage = 'You need to login to TronLink first, before connecting.'
			}
			sessionStorage.setItem('isConnected', 'true')
			connectedAddress.set(accounts.tronWeb.defaultAddress.base58)
            let address = JSON.stringify([{address: accounts.tronWeb.defaultAddress.base58}])

            const submitData = async (url) => { // sending address to express and postgres
                const res = await fetch(url, {
                    method: 'post',
                    headers: {'Content-Type': 'application/json'},
                    body: address,
                })
                if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`)
                return res
            }
            submitData(url0)
                .then(res => console.log(res))
                .catch(err => console.error(err))



			sessionStorage.setItem('connectedAddress', accounts.tronWeb.defaultAddress.base58)
			console.log(accounts.tronWeb.defaultAddress.base58)
			if (res.code === 4001) {
				throw new Error(`TronLink error: ${res.message}`)
			}
		} catch (error) { console.log(error) }
    }

    function sendUsername() {
        let JSONusername = JSON.stringify({address: $connectedAddress, username: usernameValue})
        console.log(JSONusername)
        const submitData = async (url) => { // sending address to express and postgres
            const res = await fetch(url, {
                method: 'post',
                headers: {'Content-Type': 'application/json'},
                body: JSONusername,
            })
            if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`)
            return res
        }
        submitData(url1)
            .then(res => console.log(res))
            .catch(err => console.error(err))
    }


    let test
    async function testInvoke() {
        test = await window.tronWeb.contract().at('TENC2BLF8ZE59DpkZ8pFxh5krGfJZYyyuM')
        console.log(test)
        let price = 100 * 1000000
        async function createGame(gameID, addr, stake) {
            price = 100 * 1000000
            const result = await test.startGame(gameID,addr,stake).send({
                
                feeLimit:100_000_000,
                callValue:price,
                shouldPollResponse:true
            });
        }
        createGame(8151, $connectedAddress, price)
        
    }
</script>


<div>
    <!-- <button class='btn btn-success' on:click={test}>Test</button> -->
    {#if !$connectedAddress}
        <button class='btn btn-primary' on:click={tronlinkAuth}>
            Connect with Tronlink
        </button>

    {:else if $connectedAddress}
        <button class='btn btn-primary' on:click={dropDown}>
            {$connectedAddress.substring(0,5)}...{$connectedAddress.substring(29,33)}

        </button>
        {#if isExpanded}
            <div class='absolute bg-white text-black text-xl sans-serif rounded-sm 
            w-40 max-h-2/4 z-20 dark:bg-zinc-700 border-2 border-black
            dark:border-0 dark:border-zinc-700'>
                Input a username here: <input bind:value={usernameValue} required class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-sm text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-xs">
                {#if usernameValue && usernameValue.length > 3}
                    <button on:click={sendUsername} class='btn btn-primary'>Set username</button>
                {:else}
                    <button on:click={sendUsername} class='btn btn-primary'>Set username</button>
                {/if}

            </div>

        {/if}
    
    {/if}
    <button class='btn btn-primary' on:click={testInvoke}>Test</button>
</div>

<style>

    /* .dropdown {
        display: absolute;
        background-color: white;
        border-radius: 0.125rem;
        border-color: black;
        max-width: 100%;
        width: 200px;
        max-height: 50%;
        border: 2px;

    } */
</style>