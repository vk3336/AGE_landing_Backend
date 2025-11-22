const express=require('express');
const router =express.Router();
const defaultseocontroller = require('../controller/defaultseocontroller');

router.post('/',defaultseocontroller.createdefaultseo);

router.get('/',defaultseocontroller.getdefaultseo);

router.put('/:id',defaultseocontroller.updatedefaultseo);

router.delete('/:id',defaultseocontroller.deletedefaultseo);

module.exports=router;