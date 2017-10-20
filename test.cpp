#include<stdio.h>
#include<iostream>
using namespace std;
int check(int n)
{
	int m=n;
	int l=0;
	while(m)
	{
		l++;
		m=m>>1;
	}
	int i=0,j=l-1;
	while(i<j)
	{
		if((1&(n>>i))!=(1&(n>>j)))
			return 0;
		i++;j--;
	}
	return 1;
}
long long int dp[505]={0};
int main()
{
	int a,b;
	for(int i=1;i<=500;i++)
		dp[i]=dp[i-1]+(check(i)?i:0);
	for(int i=1;i<=500;i++)
		for(int j=i;j<=500;j++)
	{
		long long int ans=dp[j]-dp[i];
		cout<<i<<" "<<j<<" "<<ans<<endl;
	}
	return 0;
}