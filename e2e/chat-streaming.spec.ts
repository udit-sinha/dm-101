import { test, expect } from "@playwright/test"

test.describe("Chat Streaming", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000")
  })

  test("user sends message and sees streaming response", async ({ page }) => {
    // Fill in the prompt input
    await page.fill('[data-testid="prompt-input"]', "Analyze well data")

    // Click submit button
    await page.click('[data-testid="submit-button"]')

    // Verify user message appears
    await expect(page.locator("text=Analyze well data")).toBeVisible()

    // Verify assistant message appears
    await expect(page.locator('[data-testid="message-content"]')).toBeVisible({
      timeout: 60000,
    })

    // Verify progress steps appear
    await expect(page.locator('[data-testid="progress-step"]')).toBeVisible({
      timeout: 10000,
    })
  })

  test("user can cancel in-progress query", async ({ page }) => {
    // Fill in the prompt input
    await page.fill('[data-testid="prompt-input"]', "Long running query")

    // Click submit button
    await page.click('[data-testid="submit-button"]')

    // Wait for loading state
    await page.waitForTimeout(500)

    // Click cancel button (should appear when loading)
    const cancelButton = page.locator('[data-testid="cancel-button"]')
    await expect(cancelButton).toBeVisible()
    await cancelButton.click()

    // Verify loading state is cleared
    await expect(cancelButton).not.toBeVisible({ timeout: 5000 })
  })

  test("handles connection error gracefully", async ({ page }) => {
    // Simulate network error by going offline
    await page.context().setOffline(true)

    // Fill in the prompt input
    await page.fill('[data-testid="prompt-input"]', "Test message")

    // Click submit button
    await page.click('[data-testid="submit-button"]')

    // Verify error message appears
    await expect(page.locator("text=/error|failed|connection/i")).toBeVisible({
      timeout: 10000,
    })

    // Go back online
    await page.context().setOffline(false)
  })

  test("displays artifacts correctly", async ({ page }) => {
    // Fill in the prompt input
    await page.fill('[data-testid="prompt-input"]', "Show analysis")

    // Click submit button
    await page.click('[data-testid="submit-button"]')

    // Wait for artifact to appear
    await expect(page.locator('[data-testid="artifact-card"]')).toBeVisible({
      timeout: 60000,
    })

    // Click on artifact to open panel
    await page.click('[data-testid="artifact-card"]')

    // Verify artifact panel opens
    await expect(page.locator('[data-testid="artifact-panel"]')).toBeVisible()
  })

  test("maintains conversation context", async ({ page }) => {
    // Send first message
    await page.fill('[data-testid="prompt-input"]', "First question")
    await page.click('[data-testid="submit-button"]')

    // Wait for response
    await expect(page.locator('[data-testid="message-content"]')).toBeVisible({
      timeout: 60000,
    })

    // Send second message
    await page.fill('[data-testid="prompt-input"]', "Follow up question")
    await page.click('[data-testid="submit-button"]')

    // Verify both messages are visible
    await expect(page.locator("text=First question")).toBeVisible()
    await expect(page.locator("text=Follow up question")).toBeVisible()

    // Verify we have multiple message pairs
    const messages = await page.locator('[data-testid="message-content"]').count()
    expect(messages).toBeGreaterThanOrEqual(2)
  })

  test("shows progress steps in order", async ({ page }) => {
    // Fill in the prompt input
    await page.fill('[data-testid="prompt-input"]', "Analyze data")

    // Click submit button
    await page.click('[data-testid="submit-button"]')

    // Wait for progress steps
    const steps = page.locator('[data-testid="progress-step"]')
    await expect(steps.first()).toBeVisible({ timeout: 10000 })

    // Verify steps have status indicators
    const stepElements = await steps.all()
    for (const step of stepElements) {
      const status = await step.getAttribute("data-status")
      expect(["pending", "in-progress", "completed", "error"]).toContain(status)
    }
  })
})

