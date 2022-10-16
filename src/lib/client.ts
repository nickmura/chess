

const url:any = 'http://localhost:5000/rooms'
const callValue = async (url: any) => {
    const res = await fetch(url, {
        method: 'get',
        headers: {'Content-Type': 'application/json'},
    })

if (!res.ok) { throw new Error(`${res.status}: ${res.statusText}`) }
    return res

callValue(url)
.then(res => console.log(res))
.catch(err => console.error(err))
}

export {callValue}
