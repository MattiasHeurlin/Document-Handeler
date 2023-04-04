var express = require('express');
var router = express.Router();
const uuid = require('uuid');

router.get('/', function (req, res, next) {
    const sql = 'SELECT * FROM documents';

    req.app.locals.db.query(sql, function (err, result) {
        if (err) {
            console.log('Error getting documents');
            return;
        }
        console.log('Documents retrieved');
        res.status(200).send(result);
    }
    );
});


router.post('/add', function (req, res, next) {
    const title = req.body.title;
    const content = req.body.content;
    const userId = req.body.userId;
    const documentId = uuid.v4();
    if (!title || !content || !userId) {
        res.status(400).send({ message: 'Bad Request' });
        return;
    }

    // Check if user ID exists
    const userSql = 'SELECT id FROM users WHERE id = ?';
    req.app.locals.db.query(userSql, [userId], function (err, userResult) {
        if (err) {
            console.log('Error checking user ID');
            res.status(500).send({ message: 'Error checking user ID' });
            return;
        }

        if (userResult.length === 0) {
            res.status(404).send({ message: 'User not found' });
            return;
        }

        // User ID exists, proceed to insert document
        const insertDocumentSql = 'INSERT INTO documents (id, title, content) VALUES (?, ?, ?)';
        req.app.locals.db.query(insertDocumentSql, [documentId, title, content], function (err, documentResult) {
            if (err) {
                console.log('Error inserting document');
                res.status(500).send({ message: 'Error inserting document', error: err });
                return;
            }

            // Document inserted, now create the connection in user_documents
            const insertUserDocumentSql = 'INSERT INTO user_documents (user_id, document_id) VALUES (?, ?)';
            req.app.locals.db.query(insertUserDocumentSql, [userId, documentId], function (err, userDocumentResult) {
                if (err) {
                    console.log('Error creating user-document connection');
                    res.status(500).send('Error creating user-document connection');
                    return;
                }

                res.status(200).send({ message: 'Document added successfully', documentId: documentId });
            });
        });
    });
});

router.get('/:userId', function (req, res, next) {
    const userId = req.params.userId;
    if (!userId) {
        res.status(400).send('Bad Request');
        return;
    }

    const sql = `
        SELECT d.*
        FROM documents d
        JOIN user_documents ud ON d.id = ud.document_id
        WHERE ud.user_id = ?
    `;

    req.app.locals.db.query(sql, [userId], function (err, result) {
        if (err) {
            console.log('Error getting documents for user');
            res.status(500).send({ message: 'Error getting documents for user' });
            return;
        }
        if (result.length === 0) {
            res.status(404).send({ message: 'No documents found for user' });
            return;
        }
        res.status(200).send(result);
    });
});

router.delete('/delete/:userId/:documentId', function (req, res, next) {
    // 

    const documentId = req.params.documentId;
    const userId = req.params.userId;

    if (!documentId || !userId) {
        res.status(400).send('Bad Request');
        return;
    }

    const checkRightsSql = `
      SELECT COUNT(*) as count
      FROM user_documents
      WHERE user_id = ? AND document_id = ?
    `;
        // Checks if the user has any documents with the given ID
    req.app.locals.db.query(checkRightsSql, [userId, documentId], function (err, result) {
        if (err) {
            console.log('Error checking ownership');
            res.status(500).send({ message: 'Internal Server Error' });
            return;
        }
        
        if (result[0].count === 0) {
            res.status(404).send({ message: 'Document does not belong to user or does not exist' });
            return;
        }

        const deleteDocumentSql = `
        DELETE FROM documents
        WHERE id = ?
        `;

        req.app.locals.db.query(deleteDocumentSql, [documentId], function (err, result) {
            if (err) {
                console.log('Error deleting document');
                res.status(500).send('Internal Server Error');
                return;
            }
            res.status(200).send({ message: 'Document deleted' });
        });
    });
});

module.exports = router;




