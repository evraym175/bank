const successResponse = ( 
{   res, 
    status =200,
    message = "done",
    data = undefined,
    balance = undefined
}={})=>
{
    return res.status(status).json({message , data , balance})
}
export default successResponse