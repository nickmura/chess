<script>
    //@ts-nocheck
    let test
    async function testInvoke() {
        test = await window.tronWeb.contract().at('TENC2BLF8ZE59DpkZ8pFxh5krGfJZYyyuM')
        console.log(test)
    }
</script>