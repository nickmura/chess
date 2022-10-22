var parameter = [{type:'address',value:'TV3nb5HYFe2xBEmyb3ETe93UGkjAhWyzrs'},{type:'uint256',value:100}];
var options = {
        feeLimit:100000000,
        callValue:0,
        tokenValue:10,
        tokenId:1000001
    };
const transaction = await tronWeb.transactionBuilder.triggerSmartContract("419e62be7f4f103c36507cb2a753418791b1cdc182", "transfer(address,uint256)", options,
    parameter,"417946F66D0FC67924DA0AC9936183AB3B07C81126");

 // {
//     "result": {
//         "result": true
//     },
//     "transaction": {
//         "visible": false,
//         "txID": "482b1a3b61894f75ea25bd10b14335a4db86c7e2c642ae07abc5a8ae45fb0027",
//         "raw_data": {
//             "contract": [
//                 {
//                     "parameter": {
//                         "value": {
//                             "data": "a9059cbb000000000000000000000000d148171f1ceeeb40d668c47d70e7e94e679775590000000000000000000000000000000000000000000000000000000000000064",
//                             "token_id": 1000001,
//                             "owner_address": "417946f66d0fc67924da0ac9936183ab3b07c81126",
//                             "call_token_value": 10,
//                             "contract_address": "419e62be7f4f103c36507cb2a753418791b1cdc182"
//                         },
//                         "type_url": "type.googleapis.com/protocol.TriggerSmartContract"
//                     },
//                     "type": "TriggerSmartContract"
//                 }
//             ],
//             "ref_block_bytes": "3a27",
//             "ref_block_hash": "83ca272ba6030b83",
//             "expiration": 1581935001000,
//             "fee_limit": 100000000,
//             "timestamp": 1581934943649
//         },
//         "raw_data_hex": "0a023a27220883ca272ba6030b8340a8fbb195852e5ab401081f12af010a31747970652e676f6f676c65617069732e636f6d2f70726f746f636f6c2e54726967676572536d617274436f6e7472616374127a0a15417946f66d0fc67924da0ac9936183ab3b07c811261215419e62be7f4f103c36507cb2a753418791b1cdc1822244a9059cbb000000000000000000000000d148171f1ceeeb40d668c47d70e7e94e679775590000000000000000000000000000000000000000000000000000000000000064280a30c1843d70a1bbae95852e900180c2d72f"
//     }
// }