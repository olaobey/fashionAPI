const pool = require("../db/config");

class Card {
  /**
   * Adds new card to the database
   *
   * @param {data} data The card info to enter into database
   * @return {Oject} The new card
   */
  async create(data) {
    try {
      // pg query
      const createQuery = `INSERT INTO cards (
                                    card_type, 
                                    provider, 
                                    card_no, 
                                    cvv, 
                                    exp_month,
                                    exp_year, 
                                    billing_address_id,
                                    user_id)
                                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                                RETURNING *`;

      // pg values
      const values = [
        data.card_type,
        data.provider,
        data.card_no,
        data.cvv,
        data.exp_month,
        data.exp_year,
        data.billing_address_id,
        data.user_id,
      ];

      // make query
      const result = await pool.query(createQuery, values);

      // check for valid results
      if (result.rows.length > 0) {
        return result.rows[0];
      } else {
        return null;
      }
    } catch (err) {
      throw new Error(err);
    }
  }

  /**
   * Updates a card in the database
   *
   * @param {Object} data Data about card to update
   * @return {Oject} The updated card
   */
  async update(data) {
    try {
      // pg query
      const createQuery = `UPDATE cards  
                                SET card_type=$2, 
                                    provider=$3, 
                                    card_no=$4, 
                                    cvv=$5, 
                                    exp_month=$6,
                                    exp_year=$7,
                                    billing_address_id=$8, 
                                    modified=now()
                                WHERE id = $1
                                RETURNING *`;

      // pg values
      const values = [
        data.id,
        data.card_type,
        data.provider,
        data.card_no,
        data.cvv,
        data.exp_month,
        data.exp_year,
        data.billing_address_id,
      ];

      // make query
      const result = await db.query(createQuery, values);

      // check for valid results
      if (result.rows.length > 0) {
        return result.rows[0];
      } else {
        return null;
      }
    } catch (err) {
      throw new Error(err);
    }
  }

  /**
   * Returns card associated with id in database, if exists
   *
   * @param {number} id the id to find card based on
   * @return {Object|null} the card
   */
  async findById(id) {
    try {
      // pg query
      const createQuery = `SELECT *
                                FROM cards 
                                WHERE id = $1`;

      // make query
      const result = await db.query(createQuery, [id]);

      // check for valid results
      if (result.rows.length > 0) {
        return result.rows[0];
      } else {
        return null;
      }
    } catch (err) {
      throw new Error(err);
    }
  }

  /**
   * Returns all cards associated with user_id in database, if exists
   *
   * @param {number} user_id the user's id to find cards based on
   * @return {Arrray} the cards
   */
  async findByUserId(user_id) {
    try {
      // pg query
      const createQuery = `SELECT *
                                FROM cards 
                                WHERE user_id = $1`;

      // make query
      const result = await pool.query(createQuery, [user_id]);

      // check for valid results
      if (result.rows.length > 0) {
        return result.rows;
      } else {
        return [];
      }
    } catch (err) {
      throw new Error(err);
    }
  }

  /**
   * Deletes card associated with id in database, if exists
   *
   * @param {string} id the id to delete card based on
   * @return {Object|null} the card
   */
  async delete(id) {
    try {
      // pg statement
      const createQuery = `DELETE FROM cards  
                                WHERE id=$1
                                RETURNING *`;

      // make query
      const result = await pool.query(createQuery, [id]);

      // check for valid results
      if (result.rows.length > 0) {
        return result.rows[0];
      } else {
        return null;
      }
    } catch (err) {
      throw new Error(err);
    }
  }
}

module.exports = new Card();
