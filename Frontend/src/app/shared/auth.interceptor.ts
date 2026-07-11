import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const currentUser = localStorage.getItem('current-user');
  if(currentUser)
  {
    const parsedUser = JSON.parse(currentUser);
    if (parsedUser.token) {
      const authReq = req.clone({
        setHeaders: { Authorization: `Bearer ${parsedUser.token}` }
      });
      return next(authReq);
    }
  }

  return next(req);
};
