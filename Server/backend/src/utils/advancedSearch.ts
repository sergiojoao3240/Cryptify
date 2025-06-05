import mongoose from "mongoose";

interface Populate {
  path: string;
  populate?: Populate | Populate[];
}

/**
 * Advanced search for more efficient Get methods.
 * Manual at the end of the file
 * @param req request 
 * @param model Model where you will do the search
 * @param populate (Optional) string or string to populate function of mongoDB (Ex: "idStatus", "idStatus,idType", "idStatus:idStatusType,idType")
 * @param filter (Optional) json  to pass as parameter to find function of MongoDB
 * @returns 
 */
export async function advancedSearch(req: any, model: any, populate: string = "", filter: any = {}) {
  /* Copy req.query to a variable */
  const reqQuery = { ...req.query };

  /* Exclude the fields we are searching for */
  const removeFields = ['select', 'sort', 'page', 'limit', 'userinfo', 'populate', 'file', 'user'];

  /* Loop over removeFields and delete them from reqQuery */
  removeFields.forEach(param => delete reqQuery[param]);

  /* Create query string to manipulate it */
  let queryStr = JSON.stringify(reqQuery);

  /* Create operators ($gt, $gte, etc) removed by input sanitation 
     Ex: usage  Postman /api/v1/measurements?^vaule[gt]=3
     TODO: add in and nin;
  */
  queryStr = queryStr.replace(/\b(ne|gt|gte|lt|lte|eq)\b/g, match => `$${match}`);

  /* Put filter to run the FIND method */
  let combinedJson;
  if (filter) {
    combinedJson = Object.assign(JSON.parse(queryStr), filter);
  } else {
    combinedJson = JSON.parse(queryStr);
  }

  let query: mongoose.Query<any[], any>;
  // First find and then populate. 
  // DANGER: You can only find elements in the main collection.
  if (req.query.userinfo) {
    query = model.find(combinedJson)
      .select("+password")
      .select("+refresh_token");
  } else {
    /* Finding resource */
    query = model.find(combinedJson);
  }

  /* Select Fields */
  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields);
  }

  /* Sort */
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-_id'); // By default sort by _id -> index contains a timestamp 
  }
  
  /* Pagination */
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const startIndex = (page - 1) * limit;
  const total = await model.countDocuments(combinedJson);

  query = query.skip(startIndex).limit(limit); 

  //Priority in the functions defined in the backend.
  if (populate.length !== 0) {
    const populate_json = process_populate(populate);
    populate_json.forEach(field => {
        query = query.populate(field);
    });

  } else if (req.query.populate) { // se receber populate por parametro , separar os campos por virgula e popula.
    const populate_json: object = process_populate(req.query.populate);
    query = query.populate(populate_json);
  }

  /*
  //Another possibility to return the Pagination  
  const pagination :any = {};
  const endIndex = page * limit;

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    };
  }
  //Add "pagination" object to the return and remove page and limit!
  */

  /* Executing query */
  const results = await query.exec();

  return {
    page: page, // Current page number.
    last_page: Math.ceil(total / limit),  //Last page
    limit_per_page: limit, // Maximum number of documents per page.
    docs_in_page: results.length, //Number of documents on this page
    total_docs: total, // total documents with filter
    data: results
  };
};

/**
* 
* @param pop_str string passed by request for populate
* @returns array of populate objects to pass to Mongo populate function
*/

function process_populate(pop_str: string): Populate[] {
  if (pop_str === "") return [];

  // Split input and create the JSON structure for map
  const items = pop_str.replace(/["]/g, '').split(',');
  const populateArray: Populate[] = [];

  items.forEach(item => {
    const itemparts = item.split(':');
    let currentPopulate: Populate = { path: itemparts[0].trim() };

    let temp = currentPopulate;
    for (let i = 1; i < itemparts.length; i++) {
      const nestedPopulate: Populate = { path: itemparts[i].trim() };
      temp.populate = nestedPopulate;
      temp = nestedPopulate;
    }

    populateArray.push(currentPopulate);
  });

  return populateArray;
}

/* 
AdvancedSearch user Manual:


AdvancedSearch usage for FrontEnd:
Document Example:
    {
    _id:1  
    name: Measurement 1
    value:10
    }

Usage:
base of Query string =  /api.XXX.ss-centi.com/measurements?WRITE_HERE

Pagination:
  - page=10
  - limit=5 

Sorting output:
  -sort="value"  (For decreasing use: "-value" )

Select just a few fields:
  - select="name,value"

For filter in the main Document :ne|gt|gte|lt|lte|nin|in 
  - value[ne]=5(not equals to 5)
  - value[gt]=5(greater then  5)
  - value[gte]=5 (greater then or equals to 5 )
  - value[lt]=5 (less then  5 )
  - value[lte]=5 (less then or equals to 5 )
  - value[in]=[1,2,3] (must be one of the list)
  - value[nin]= [1,2,3](not in the list)


Populate with query :
  -populate=idModule:idsensor,idUser

  To go through chain of documents use ":"" . 
  If it is in the same document use "," to separate fields for populate .
  In this example,the main document will populate idModule and IdUser, and the idSensor will also be populated in the idModule document. 
*/


/**
 * Search to perform aggregate function of mongo. Is used to performed more advanced queries to mongo.
 * 
 * @param req request 
 * @param model Model where you will do the agregation
 * @param op_agregators - all operators to perform the agregation.
 * @returns 
 */
export async function aggregateSearch(req: any, model: any, op_agregators: any = []) {
  let combined_agregators: any = [...op_agregators];// shallow copy

  /* Pagination */
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const startIndex = (page - 1) * limit;

  combined_agregators.push({ $skip: startIndex });
  combined_agregators.push({ $limit: limit });
  //calculate total documents and excute query in parellel
  let finalQuery: any = [{
    $facet: {
      "total_docs": [{ $group: { _id: null, counter: { $sum: 1 } } }], //all documents without pagination
      "data": combined_agregators
    }
  }];
  /* Executing query */
  const results = await model.aggregate(finalQuery);
  const total = results[0]?.total_docs[0]?.counter ?? 0;//if is undifined retunrs 0.

  return {
    page: page, // Current page number.
    last_page: Math.ceil(total / limit),  //Last page
    limit_per_page: limit, // Maximum number of documents per page.
    docs_in_page: results[0].data.length, //Number of documents on this page
    total_docs: total, // total documents with filter
    data: results[0].data
  };
};


/**
 * Add pagination to responses in arrays 
 * 
 * @param req request 
 * @param model Model where you will do the agregation
 * @returns 
 */
export async function AddPagination(req: any, data: any[]) {

  /* Pagination */
  const page = parseInt(req.query.page, 10) || 1; 
  const limit = parseInt(req.query.limit, 10) || 25;
  const startIndex = (page - 1) * limit; 
  const endIndex = page * limit;
  const total = data.length; 

  const paginatedData = data.slice(startIndex, endIndex);

  return {
    page,
    last_page: Math.ceil(total / limit),
    limit_per_page: limit,
    docs_in_page: paginatedData.length,
    total_docs: total,
    data: paginatedData
  };
};