// ICE server urls to be used for CPaaS production only.
export const configs = [
  {
    name: 'us',
    data: {
      KANDYTURN1: 'turns:turn-ucc-1.genband.com:443?transport=tcp',
      KANDYSTUN1: 'stun:turn-ucc-1.genband.com:3478?transport=udp',
      KANDYTURN2: 'turns:turn-ucc-2.genband.com:443?transport=tcp',
      KANDYSTUN2: 'stun:turn-ucc-2.genband.com:3478?transport=udp',
      KANDYFQDN: 'oauth-cpaas.att.com',
      KANDY: 'Kandy'
    }
  }
]
