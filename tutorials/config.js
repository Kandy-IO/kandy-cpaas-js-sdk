// ICE server urls to be used for CPaaS production only.
export const configs = [
  {
    name: 'us',
    data: {
      KANDYTURN1: 'turns:turn-na-1.kandy.io:443?transport=tcp',
      KANDYSTUN1: 'stun:turn-na-1.kandy.io:3478?transport=udp',
      KANDYTURN2: 'turns:turn-na-2.kandy.io:443?transport=tcp',
      KANDYSTUN2: 'stun:turn-na-2.kandy.io:3478?transport=udp',
      KANDYFQDN: 'oauth-cpaas.att.com',
      KANDY: 'Kandy'
    }
  }
]
