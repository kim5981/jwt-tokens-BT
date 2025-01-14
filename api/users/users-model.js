const db = require('../../data/db-config.js');

function find() {
  /**

    Resolves to
    [
      {
        "user_id": 1,
        "username": "bob",
        "role_name": "admin"
      },
      {
        "user_id": 2,
        "username": "sue",
        "role_name": "instructor"
      }
    ]

    select username, user_id, role_name
    from users as u
    join roles as r 
    on u.user_id = r.role_id;

   */
  return db("users")
  .join("roles", "users.user_id", "=", "roles.role_id")
  .select("username", "user_id", "role_name")
}

function findBy(filter) {
  /**
    !! filter needs to be an object !!   
  
    [
      {
        "user_id": 1,
        "username": "bob",
        "password": "$2a$10$dFwWjD8hi8K2I9/Y65MWi.WU0qn9eAVaiBoRSShTvuJVGw8XpsCiq",
        "role_name": "admin",
      }
    ]

     select username, user_id, role_name, password
    from users as u
    join roles as r 
    on u.user_id = r.role_id;
    where users.user_id = 1 <-- 1 being input into fn
   */
  return db("users")
  .join("roles", "users.user_id", "=", "roles.role_id")
  .select("users.*", "role_name")
  .where(filter)
}

function findById(user_id) {
  /**
  
    Resolves to 

    {
      "user_id": 2,
      "username": "sue",
      "role_name": "instructor"
    }

     select username, user_id, role_name
      from users as u
      join roles as r 
      on u.user_id = r.role_id
      where u.user_id = 1;

   */
      return db("users")
      .join("roles", "users.user_id", "=", "roles.role_id")
      .select("username", "user_id", "role_name")
      .where("users.user_id", user_id).first()
}

/**
  Creating a user requires a single insert (into users) if the role record with the given
  role_name already exists in the db, or two inserts (into roles and then into users)
  if the given role_name does not exist yet.

  When an operation like creating a user involves inserts to several tables,
  we want the operation to succeed or fail as a whole. It would not do to
  insert a new role record and then have the insertion of the user fail.

  In situations like these we use transactions: if anything inside the transaction
  fails, all the database changes in it are rolled back.

  {
    "user_id": 7,
    "username": "anna",
    "role_name": "team lead"
  }
 */
async function add({ username, password, role_name }) {
  let created_user_id
  await db.transaction(async trx => { // rollback if changes occurred in one table but not the other
    let role_id_to_use
    const [role] = await trx('roles').where('role_name', role_name) // check if role exists
    if (role) {
      role_id_to_use = role.role_id
    } else {
      const [role_id] = await trx('roles').insert({ role_name: role_name }) // we can use the existing role as id for new user
      role_id_to_use = role_id
    }
    const [user_id] = await trx('users').insert({ username, password, role_id: role_id_to_use }) // else we add a new one and use that id instead
    created_user_id = user_id
  })
  return findById(created_user_id)
}

module.exports = {
  add,
  find,
  findBy,
  findById,
};
