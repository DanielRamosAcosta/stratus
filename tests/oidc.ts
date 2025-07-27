const autheliaDaniUserInfo = {
  email: "danielramosacosta1@gmail.com",
  email_verified: true,
  family_name: "Ramos Acosta",
  given_name: "Daniel",
  groups: ["admins", "dev"],
  locale: "es-ES",
  name: "Dani",
  picture:
    "https://2.gravatar.com/avatar/bd9cf3cfa5c4875128bdd435d7f304403c6c883442670a1cd201abf85d3858d1?size=512&d=initials",
  preferred_username: "dani",
  rat: 1753633683,
  sub: "24aa99e8-28f2-463f-bf2e-a972dd95a2f2",
  updated_at: 1753633693,
  zoneinfo: "Europe/Madrid",
};

const dexDaniUserInfo = {
  iss: "https://localhost:5556/dex",
  sub: "CiQ5OGIwODBiNS0yNGU0LTRiMGYtOTc5Yy00M2E5YzQyZTNjMTcSBWxvY2Fs",
  aud: "stratus",
  exp: 1753720765,
  iat: 1753634365,
  at_hash: "j6GJlms07XMfQwJP3hJFYw",
  email: "dani@example.com",
  email_verified: true,
  name: "Dani",
};

const autheliaDaniIntrospection = {
  active: true,
  client_id: "stratus",
  exp: 1753637293,
  iat: 1753633692,
  scope: "openid email profile groups",
  sub: "24aa99e8-28f2-463f-bf2e-a972dd95a2f2",
  username: "Dani",
};

const dexDaniIntrospection = {
  active: true,
  client_id: "stratus",
  sub: "CiQ5OGIwODBiNS0yNGU0LTRiMGYtOTc5Yy00M2E5YzQyZTNjMTcSBWxvY2Fs",
  exp: 1753720765,
  iat: 1753634365,
  nbf: 1753634365,
  aud: "stratus",
  iss: "https://localhost:5556/dex",
  token_type: "Bearer",
  token_use: "access_token",
  ext: {
    email: "dani@example.com",
    email_verified: true,
    name: "dani",
  },
};
