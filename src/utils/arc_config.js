

module.exports = {
    algodClientUrl: "https://algoindexer.testnet.algoexplorerapi.io",
    algodClientPort: "",
    algodClientToken: "",
    pinataApiKey: process.env.REACT_APP_PINATA_API_KEY,
    pinataApiSecret: process.env.REACT_APP_PINATA_SECRET_KEY,
    pinataFileUrl: "https://api.pinata.cloud/pinning/pinFileToIPFS",
    pinataJSONUrl: "https://api.pinata.cloud/pinning/pinJSONToIPFS",
    ipfsNode: "http://localhost:5002",
    arc3MetadataJSON: {
        "name": "",
        "description": "",
        "image": "ipfs://",
        "image_integrity": "sha256-",
        "image_mimetype": "image/png",
        "animation_url": "",
        "animation_url_integrity": "sha256-",
        "animation_url_mimetype": "",
    }

}
