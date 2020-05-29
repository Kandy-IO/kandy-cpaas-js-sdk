// ICE server urls to be used for CPaaS production only.
export const configs = [
  {
    name: 'us',
    data: {
      KANDYTURN1: 'turns:turn-1-cpaas.att.com:443?transport=tcp',
      KANDYSTUN1: 'stun:turn-1-cpaas.att.com:3478?transport=udp',
      KANDYTURN2: 'turns:turn-2-cpaas.att.com:443?transport=tcp',
      KANDYSTUN2: 'stun:turn-2-cpaas.att.com:3478?transport=udp',
      KANDYFQDN: 'oauth-cpaas.att.com',
      KANDY: 'Kandy'
    }
  }
]
