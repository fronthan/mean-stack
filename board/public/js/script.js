$(function(){
    /* ---------------------
    * 일반 단위, 시간 표시 변환 함수들    
     ----------------------- */
    function get2digits(num) {
        return('0' +num).slice(-2)
    }

    function getDate(dateObj) {
        if(dateObj instanceof Date) {
            return dateObj.getFullYear() + '-' + get2digits(dateObj.getMonth()+1)+'-'+ get2digits(dateObj.getDate());
        }
    }

    function getTime(dateObj) {
        if(dateObj instanceof Date) {
            return get2digits(dateObj.getHours()) + ':' + get2digits(dateObj.getMinutes())+':' + get2digits(dateObj.getSeconds());
        }
    }

    function convertDate() {
        $('[data-date]').each(function(index, element){
            var dateString = $(element).data('date');
            if(dateString) {
                var date = new Date(dateString);
                $(element).html(getDate(date));
            }
        });
    }

    function convertDateTime(){
        $('[data-date-time]').each(function(index, element){
            var dateString = $(element).data('date-time');
            if(dateString) {
                var date = new Date(dateString);
                $(element).html(getDate(date) + ' ' +getTime(date));
            }
        });
    }

    convertDate();
    convertDateTime();

    
    /* ---------- 
    *  검색관련 
     ----------- */
    var search = window.location.search; //query String 정보가 들어있다 -> ?searchType=title&searchText=text 의 형태
    var params = {};

    if(search) {//위의 search 값을 query string 오브젝트로 바꿔준다 (IE를 위한 조치)
        $.each(search.slice(1).split('&'), function(index,param) {
            var index = param.indexOf('=');

            if(index>0) {
                var key = param.slice(0, index);
                var value = param.slice(index+1);

                if (!params[key]) params[key] = value;
            }
        });
    }

    if(params.searchText && params.searchText.length>=3 ) {
        $('[data-search-highlight]').each(function(index, element) {// $this 값을 searchType과 비교해 일치하는 경우 searchText를 regex로 찾아 해당 글자에 하이라이트 클래스 추가한다 
            var $element = $(element);
            var searchHighlight = $element.data('search-highlight');
            var index = params.searchType.indexOf(searchHighlight);

            if(index >= 0) {
                var decodedSearchText = params.searchText.replace(/\+/g, ' '); //searchText에 공백이 있는 경우, query string으로 '+' 문자가 삽입되므로 ''으로 치환해준다.
                //여기서 'g 옵션'은 일치하는 여러 개의 값을 모두 찾는다
                decodedSearchText = decodeURI(decodedSearchText);
                //특수문자를 위해 디코딩

                var regex = new RegExp(`(${decodedSearchText})`, 'ig'); //'ig 옵션'은 대소문자 구별안하고 & 전체를 대상으로 찾는다
                $element.html($element.html().replace(regex, '<span class="highlighted">$1<span>'));
            }
        });
    }


    /* ------------------------------------------------------------
     게시물의 제목이 아주 긴 경우 댓글의 수를 '...'다음에 표시해주기 위한 코드
     ------------------------------------------------------------ */
     function resetTitleEllipsisWidth() {
         $('.board-table .title-text').each(function(i, e) {
             var $text = $(e);
             var $ellipsis = $(e).closest('.title-ellipsis');
             var $comment = $(e).closest('.title-container').find('.title-comments');

             var textWidth = $text.width();
             var ellipsisWidth = $ellipsis.outerWidth();
             var commentWidth = $comment.outerWidth();
             var padding = 1;

             if (ellipsisWidth <= (textWidth + commentWidth + padding)) {
                 $ellipsis.width(ellipsisWidth - (commentWidth+padding));
             } else {
                 $ellipsis.width(textWidth + padding);
             }
         });
     }

     $(window).resize(function(){
         $('.board-table .title-ellipsis').css('width','');
         resetTitleEllipsisWidth();
     });
     resetTitleEllipsisWidth();
}); //jQB