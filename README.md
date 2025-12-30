# AlbaLog BE Repository
UMC 9th Demoday 알바로그 BE 팀 레포지토리입니다.

# Members
* 코디/조희승 - 인하대 9th Node.js
* 진네커/김진 - 인하대 9th Node.js
* 윤무진/김창식 - 한양대 Erica 9th Node.js
* 언년/하은현 - 동양미래대 9th Node.js
* 진/최소연 - 한성대 9th Node.js

# Stack
1. Node.js & Express
2. TypeScript
3. Tsoa & OpenAPI 3.0
4. MySQL
5. Docker
6. NginX
6. Github Actions

# Tools
1. Git & Github
2. Figma
3. Notion
4. Discord
5. Postman

# Project Directories
```
--dist          //컴파일 된 js 파일 폴더
--src           //소스코드 폴더
  --config      //서버 설정 파일 폴더
  --middleware  //서버 미들웨어 폴더
  --controller  //컨트롤러 폴더
  --service     //서비스 폴더
  --repository  //레포지토리(DB 연결) 폴더
  --routes      //라우터 폴더
  --util        //기타 유틸 파일 폴더
  app.ts        //메인 서버 파일
```

# Git Rules
레포지토리 Git과 Github 사용에 대한 규칙입니다.

## Git Commit Convention
1. 커밋 접두사로 다음과 같은 문구 명시
* feat - 신규 기능 추가
* refactor - 코드 리팩토링
* fix - 버그 수정
* docs - 문서 수정 및 추가
2. 괄호 안에 변경되거나 추가된 파일 명시
3. 커밋 메세지로 자세한 작업 내용 설명
```
//예시입니다.
feat(app.ts): 라우터 설정 추가
refactor(user.controller.ts): 회원가입 코드 리팩토링
fix(user.repository.ts): 회원가입 db 로직 수정
docs(README.md): 깃 규칙 내용 추가
```

## Git Workflow
```
1. 원본 레포지토리 포크
2. 포크 레포지토리 pull
3. 새로운 작업에 대한 이슈 생성
4. 이슈에 대한 브랜치 생성
5. 로컬 레포지토리에서 작업 후 commit
6. 로컬 레포지토리에서 원격 레포지토리로 push
7. pull request 생성
8. 리뷰 후 머지
```

## Branch Rules
1. 브랜치명은 다음과 같은 접두사를 사용한다.
* feat
* refactor
* fix
* docs
2. 브랜치명은 현재 이슈번호로 한다.
```
//예시입니다.
feat/ALBA_5
refactor/ALBA_11
fix/ALBA_13
docs/ALBA_1
```

## Pull Request Rules
1. Assignee는 자기 자신, 리뷰어는 다른 개발자들로 설정
2. 팀장의 승인 혹은 다른 사람들의 리뷰 없이 강제 머지 금지
3. 반드시 모든 사람들의 Approve를 받은 후에 머지
4. Pull Request 템플릿에 상세한 작업 내용 명시
5. Postman, Swagger 등으로 API 테스트한 내용 스크린샷 첨부

# Code Convention
Google TypeScript Sytle Guide 참고   
https://google.github.io/styleguide/tsguide.html
## Naming Convention
1. 파일명은 전부 소문자로 설정. snake_case로 작성할 것
2. 함수명은 smallCamelCase로 작성할 것
3. 클래스명은 PascalCase로 작성할 것
4. 인터페이스, 타입명은 PascalCase로 작성할 것
5. 상수명은 UPPER_SNAKE_CASE로 작성할 것
6. 객체 구조를 정의할 때에는 클래스가 아닌 인터페이스를 사용할 것
```
interface Foo {
  a: number;
  b: string;
}

const foo: Foo = {
  a: 123,
  b: 'abc',
}
```
7. any 타입은 가급적이면 사용하지 말 것.
8. undefined는 가급적이면 type에 명시하지 말 것. 실제 할당되는 곳에 추가할 것.


## Langauge Convention
1. 변수, 상수 선언에 const, let 사용. var은 사용 금지.
2. 전개 구문을 적극적으로 사용할 것(객체/배열 복사, 합체 등)
```
const foo = {
  num: 1,
};

const foo2 = {
  ...foo,
  num: 5,
};

const foo3 = {
  num: 5,
  ...foo,
}

foo2.num === 5;
foo3.num === 1;
```

3. 객체 분해 할당을 적극적으로 사용할 것. 기본값과 객체 요소는 left side에 명시할 것.
```
interface Options {
  /** The number of times to do something. */
  num?: number;

  /** A string to do stuff to. */
  str?: string;
}

function destructured({num, str = 'default'}: Options = {}) {}
```

4. private static 메서드는 지양할 것. 같은 파일에서 로컬 함수로 구현할 것.
5. primitive 타입은 wrapper 객체로 선언하지 않을 것. (String, Number 등)
