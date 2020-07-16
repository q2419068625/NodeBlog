import { query } from "express"

$(document).ready(function(){
    var ndkeyword = $("#js-keyword")
    $("#js-filter-submit").on('click',function(){
        var keyword = ndkeyword.val()

        if(keyword){
            query.keyword = keyword
        }else{
            delete query.keyword
        }
        window.location.url = window.location.origin + window.location.pathname + JSON.stringify(query)
    })
    if(typeof CKEDITOR !== 'undefined'){
        CKEDITOR.replace('js-post-content')
    }

})