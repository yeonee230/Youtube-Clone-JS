//export 해주면 다른 파일에서 이 함수를 import할 수 있다. 
export const join = (req, res) => res.send("user join! ");
export const edit = (req, res) => res.send("edit user profile! ");
export const remove = (req, res) => res.send("delete user profile! ");