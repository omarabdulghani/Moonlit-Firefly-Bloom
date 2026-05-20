export type DevScenario = 'none' | 'fullMoon' | 'moonRain' | 'fullMoonSequence';

export function getDevScenarioFromSearch(search: string): DevScenario {
  const params = new URLSearchParams(search);

  if (params.get('devFullMoonSequence') === '1') {
    return 'fullMoonSequence';
  }

  if (params.get('devMoonRain') === '1') {
    return 'moonRain';
  }

  if (params.get('devFullMoon') === '1') {
    return 'fullMoon';
  }

  return 'none';
}

export function getDevScenarioLabel(devScenario: DevScenario): string | null {
  switch (devScenario) {
    case 'fullMoon':
      return 'DEV FULL MOON';
    case 'moonRain':
      return 'DEV MOON RAIN';
    case 'fullMoonSequence':
      return 'DEV FULL MOON SEQUENCE';
    case 'none':
      return null;
  }
}
