import Video from "../models/Video"; //설정해둔 video model가져온다. 
import User from "../models/User";

//export 해주면 다른 파일에서 이 함수를 import할 수 있다. 
export const home = async(req, res) => {
    const videos = await Video.find({}).sort({createdAt : "desc" }).populate("owner");//내림차순 정렬
    return res.render("home", { pageName : "Home", videos});//home.pug 템플릿으로 videos 어레이를 전달한다. 
};

export const watch = async (req, res) => {
    //비디오 id 값을 파라미터에서 받는다.
    //db에서 해당 비디오 data 값을 id를 통해 찾아서 watch.pug 템플릿으로 보낸다. 
    const {id} = req.params;
    const video = await Video.findById(id).populate("owner");
    //const owner = await User.findById(video.owner);
    //const owner = await User.findById({_id : videoOwner});
    // console.log(`video: ${video}`);
    
    if(!video){//비디오가 없을 경우
        return res.status(404).render("404", { pageName : "Video not found!"});
    };

    return res.render("videos/watch", { pageName : video.title , video});
};

export const getEdit = async (req, res) => {
    const {id} = req.params;
    const video = await Video.findById(id);
    const {_id} =req.session.user;

    if(String(video.owner) !== String(_id)){
        return res.status(403).render("404", { pageName : "Forbbiden! "});
    }

    if(!video){//비디오가 없을 경우
        return res.status(404).render("404", { pageName : "Video not found!"});
    }

    return res.render("edit", { pageName : video.title , video});
};

export const postEdit = async(req, res) =>{
    const {id} = req.params;
    const { title, description, hashtags } = req.body;
    //const video = await Video.exists({ _id : id}); //exists() : 해당 id의 비디오가 있냐 없냐만 true/false로 알려줌.
    const video = await Video.findById(id);
    const {_id} =req.session.user;

    if(!video){
        return res.status(404).render("404", { pageName : "Video not found!"});
    }

    if(String(video.owner) !== String(_id)){ 
        return res.status(403).render("404", { pageName : "Forbbiden! "});
    }

    await Video.findByIdAndUpdate( id, {
        title,
        description,
        hashtags : Video.formatHashtags(hashtags),
    });

    return res.redirect(`/videos/${id}`);

};

//비디오 삭제 
export const delVideo = async(req, res) => {
    //1. url 파라미터에서 비디오 id 받아온다. 
    //2. findByIdDelete() 사용한다. 
    //3. 홈으로 리다이렉트 

    const {id} = req.params;
    const {_id} =req.session.user;
    const video = await Video.findById(id);

    if(!video){
        return res.status(404).render("404", { pageName : "Video not found!"});
    }

    if(String(video.owner) !== String(_id)){
        return res.status(403).redirect("/");
    }

    await Video.findByIdAndDelete(id);
    return res.redirect("/");
};

//비디오 검색 
export const search = async(req, res) => {
    //1. 검색어를 받는다. 
    //2. 검색어가 있으면 몽구스 find()를 사용해서 디비에서 검색한다. 
    //3. 검색결과와 함께 서치 화면을 리턴한다. 
    const { keyword } = req.query; //get으로 부터 값 받을 때 
    console.log("req.query : " + keyword);
    let videos =[];
    if(keyword){
        videos = await Video.find({
            title : keyword,
            // title: {
            //     //이건 mongoDB에서 지원하는 기능 
            //     $regex: new RegExp(`${keyword}$`, "i"), //i는 대,소문자 구분 무시, $ 해당키워드가 마지막에 있을 때 
            // },
        }).populate("owner");
    }
    //console.log(`검색 videos : ${videos}`);
    return res.render("search",{ pageName : "Search", videos});



}


//비디오 업로드 
export const getUpload = (req, res) => { 
    return res.render("videos/upload",{ pageName : "Upload"});
};

export const postUpload = async(req, res) => {
    const { title, description, hashtags} = req.body;
    //console.log(title, description, hashtags);
    const videoFile = req.file.path; //ES6 문법 -> const { path : videoFile } = req.file;
    const {_id} = req.session.user;

    //mongoDB에 저장하는 두번째 방법 
    try {
        const newVideo = await Video.create({
            owner:_id,
            title,
            videoFile,
            description,
            hashtags : Video.formatHashtags(hashtags),
        });
        console.log(`video :  ${newVideo}`);
        
        const user = await User.findById(newVideo.owner);
        user.videos.push(newVideo._id);
        console.log(user.videos);
        user.save();
        
        return res.redirect("/");

    } catch (error) {
        return res.render("upload",{ 
            pageName : "Upload", 
            errorMsg : error._message,
        });
    };
    


    //mongoDB에 저장하는 첫번째 방법 
    // const video = new Video({
    //     title,
    //     description,
    //     createdAt : Date.now(),
    //     hashtags : hashtags.split(",").map( word => !word.trim().startsWith("#") ? `#${word.trim()}` : word.trim()),
    //     meta : {
    //         views : 0,
    //         rating : 0,
    //     },
    // });
    // await video.save(); //db에 저장된다. 
    

   
};

//Register views
export const registerView = async(req,res) => {
    const {id} = req.params;
    const video = await Video.findById(id);
    if(!video){
        return res.status(404);
    }
    video.meta.views = video.meta.views+1;
    await video.save();
    return res.status(200);
}

