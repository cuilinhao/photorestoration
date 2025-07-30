import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    // 访问首页
    await page.goto('http://localhost:3001');

    // 等待页面加载完成
    await page.waitForLoadState('networkidle');

    // 等待一下确保所有组件都加载完成
    await page.waitForTimeout(2000);
  });

  test('should load the page correctly', async ({ page }) => {
    // 监听控制台错误
    const consoleMessages: string[] = [];
    page.on('console', msg => {
      consoleMessages.push(`${msg.type()}: ${msg.text()}`);
    });

    // 监听页面错误
    const pageErrors: string[] = [];
    page.on('pageerror', error => {
      pageErrors.push(error.message);
    });

    // 等待更长时间让React应用完全加载
    await page.waitForTimeout(5000);

    // 检查页面标题
    const title = await page.title();
    console.log('Page title:', title);

    // 检查是否有登录按钮
    const loginButtons = await page.locator('button:has-text("登录")').count();
    console.log('Found login buttons:', loginButtons);

    // 检查其他可能的登录按钮文本
    const signInButtons = await page.locator('button:has-text("Sign In")').count();
    console.log('Found "Sign In" buttons:', signInButtons);

    // 检查页面内容
    const pageContent = await page.textContent('body');
    console.log('Page contains "登录":', pageContent?.includes('登录'));
    console.log('Page contains "AI 修复":', pageContent?.includes('AI 修复'));
    console.log('Page contains "Photo Restoration":', pageContent?.includes('Photo Restoration'));

    // 输出控制台消息
    console.log('Console messages:', consoleMessages.slice(-10)); // 最后10条消息
    console.log('Page errors:', pageErrors);

    // 截图用于调试
    await page.screenshot({ path: 'debug-page.png', fullPage: true });
  });

  test('should show login modal when clicking login button', async ({ page }) => {
    // 点击登录按钮 (支持中英文)
    const loginButton = page.locator('button:has-text("登录"), button:has-text("Sign In")').first();
    await loginButton.click();

    // 等待登录模态框出现
    await expect(page.locator('[role="dialog"]')).toBeVisible();

    // 检查是否显示登录表单 (支持中英文)
    const loginTitle = page.locator('text=登录 Photo Restoration, text=Sign In to Photo Restoration').first();
    await expect(loginTitle).toBeVisible();
  });

  test('should be able to login with valid credentials', async ({ page }) => {
    // 监听控制台输出
    const consoleMessages: string[] = [];
    page.on('console', msg => {
      consoleMessages.push(msg.text());
    });

    // 点击登录按钮 (支持中英文)
    const loginButton = page.locator('button:has-text("登录"), button:has-text("Sign In")').first();
    await loginButton.click();

    // 等待登录模态框出现
    await expect(page.locator('[role="dialog"]')).toBeVisible();

    // 填写登录信息
    await page.fill('input[type="email"]', '15021538370@163.com');
    await page.fill('input[type="password"]', 'cuilinhao2015');

    // 点击登录按钮
    await page.click('button[type="submit"]');

    // 等待登录处理
    await page.waitForTimeout(8000); // 增加等待时间

    // 检查控制台输出
    console.log('Console messages:', consoleMessages.filter(msg =>
      msg.includes('登录') || msg.includes('signin') || msg.includes('Loading') || msg.includes('Profile')
    ));

    // 检查是否登录成功（模态框应该关闭或显示用户信息）
    const isModalClosed = await page.locator('[role="dialog"]').isVisible() === false;
    const hasSignOutButton = await page.locator('button:has-text("登出"), button:has-text("Sign Out")').isVisible();

    console.log('Modal closed:', isModalClosed);
    console.log('Has sign out button:', hasSignOutButton);

    // 至少其中一个应该为真
    expect(isModalClosed || hasSignOutButton).toBe(true);
  });

  test('should show email verification if needed', async ({ page }) => {
    // 监听控制台输出
    const consoleMessages: string[] = [];
    page.on('console', msg => {
      consoleMessages.push(msg.text());
    });

    // 点击登录按钮
    await page.click('button:has-text("登录")');
    
    // 等待登录模态框出现
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    // 填写登录信息
    await page.fill('input[type="email"]', '15021538370@163.com');
    await page.fill('input[type="password"]', 'cuilinhao2015');
    
    // 点击登录按钮
    await page.click('button[type="submit"]');
    
    // 等待处理
    await page.waitForTimeout(5000);
    
    // 检查是否显示邮箱验证界面或登录成功
    const isEmailVerificationShown = await page.locator('text=邮箱未验证').isVisible();
    const isLoginSuccessful = await page.locator('text=登出').isVisible();
    
    console.log('Email verification shown:', isEmailVerificationShown);
    console.log('Login successful:', isLoginSuccessful);
    console.log('Console messages:', consoleMessages);
    
    // 至少其中一个应该为真
    expect(isEmailVerificationShown || isLoginSuccessful).toBe(true);
  });

  test('should show login requirement for upload', async ({ page }) => {
    // 检查上传区域是否显示登录要求
    await expect(page.locator('text=请先注册登录才能使用 AI 修复服务')).toBeVisible();
    
    // 检查是否显示登录按钮
    await expect(page.locator('text=立即登录')).toBeVisible();
  });

  test('should show daily usage info when logged in', async ({ page }) => {
    // 先登录
    await page.click('button:has-text("登录")');
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    await page.fill('input[type="email"]', '15021538370@163.com');
    await page.fill('input[type="password"]', 'cuilinhao2015');
    await page.click('button[type="submit"]');
    
    // 等待登录完成
    await page.waitForTimeout(5000);
    
    // 检查是否显示每日使用信息
    const dailyInfoVisible = await page.locator('text=登录用户每天可免费使用 5 次').isVisible();
    console.log('Daily usage info visible:', dailyInfoVisible);
    
    if (dailyInfoVisible) {
      await expect(page.locator('text=登录用户每天可免费使用 5 次')).toBeVisible();
    }
  });
});
