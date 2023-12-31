class ApiFeatures{
    constructor(query,queryStr){
        this.query=query;
        this.queryStr=queryStr;
    }

    search(){
        const keyword=this.queryStr.keyword?{
            name:{
                $regex: this.queryStr.keyword,
                $options:"i",

            }
        }:{};
        
        this.query=this.query.find({...keyword});
        return this;
    }

    filter(){
        const queryCopy={...this.queryStr}
        console.log(queryCopy);
        //removing some fields for category
        const removeFields=["keyword","page","limit"];
        removeFields.forEach((key) => delete queryCopy[key]);

        //filter for price and rating

        let queryStr= JSON.stringify(queryCopy);
        console.log(queryStr);
        queryStr=queryStr.replace(/\b(gt|gte|lt|lte)\b/g,(key)=> `$${key}`);
        
        this.query=this.query.find(JSON.parse(queryStr));
        console.log(queryStr);
        return this;
    }

    pagination(resultPerPgae){
        const currentPage=Number(this.queryStr.page) || 1;

        const skip=resultPerPgae * (currentPage-1);
        this.query=this.query.limit(resultPerPgae).skip(skip);
        return this;
        
    }
}

module.exports=ApiFeatures