package com.game.team1.filter;

import java.io.IOException;
import java.util.HashSet;
import java.util.Set;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.annotation.WebFilter;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.springframework.web.filter.GenericFilterBean;

import com.game.team1.vo.UserInfoVO;

import lombok.extern.slf4j.Slf4j;

@WebFilter(value = { "/**", "/tmpl/*", "/api/*" })
@Slf4j
public class AuthFilter extends GenericFilterBean {
    // 인증을 건너뛸 URL 패턴의 목록
    private Set<String> excludeUrls = new HashSet<>() {
        {
            add("/tmpl/user-info/login");
            add("/tmpl/user-info/join"); 
            add("/");
        }
    };

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        if (request instanceof HttpServletRequest && response instanceof HttpServletResponse) {
            HttpServletRequest req = (HttpServletRequest) request; //요청을 req로 재 정의
            HttpServletResponse res = (HttpServletResponse) response; //응답을 res로 재정의
            String uri = req.getRequestURI(); //URI 정보를 가지고와 어떤 요청을 가진 URL인지 확인 후 uri로 재 정의
            log.info("uri=>{}", uri); //log로 확인

            HttpSession session = req.getSession(); // 세선에서 사용자 정보를 가지고 옵니다.
            UserInfoVO user = (UserInfoVO) session.getAttribute("user"); // 세션에서 user라는 사용자 정보를 user라는 변수에 등록합니다.

            if (user == null && !excludeUrls.contains(uri)) {
                // 세션에 사용자 정보가 없고, URL이 제외 목록에 없는 경우 로그인 페이지로 리디렉션
                res.sendRedirect("/tmpl/user-info/login"); //로그인 페이지로 리디렉션
                return;
            }
        }

        // 다음 필터 또는 요청 처리로 진행
        chain.doFilter(request, response);
    }
}
